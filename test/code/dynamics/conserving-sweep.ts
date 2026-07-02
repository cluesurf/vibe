// Conformance for code/dynamics/conserving-sweep: the charge-conserving perception rule and its variants.
// The load-bearing invariant is EXACT INTEGER CHARGE CONSERVATION: every local move preserves the pair
// sum (annihilate +/- -> 0/0, hop moves a charge, create 0/0 -> +/-), so the total tone sum never changes,
// for ALL variants (edge / chain / ring / tunable / hop-only / steered / pumped / hashed). Plus:
//   - hop-only conserves the count of EACH sign (nothing created or annihilated).
//   - onlyCreate cannot raise the NET charge (only mints balanced pairs).
//   - pump = null reproduces the unbiased edge-list sweep bit-for-bit (same RNG draw order).
//   - DETERMINISM under a fixed seed; hashRand is a deterministic value in [0, 1).

import {
  suite,
  check,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  conservingEdgeSweep,
  conservingEdgeSweepTunable,
  conservingChainSweep,
  conservingRingSweep,
  evolveConservingRing,
  conservingRingSweepTunable,
  conservingHopSweep,
  conservingEdgeListSweep,
  conservingEdgeListSweepPumped,
  conservingEdgeSweepSteered,
  conservingEdgeSweepHashed,
  hashRand,
} from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 40

function ringEdges(n: number): { eu: Int32Array; ev: Int32Array } {
  const eu = new Int32Array(n)
  const ev = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    eu[i] = i
    ev[i] = (i + 1) % n
  }

  return { eu, ev }
}

const edgeList = (n: number): [number, number][] =>
  Array.from(
    { length: n },
    (_, i) => [i, (i + 1) % n] as [number, number],
  )

// a deterministic ternary tone with a nonzero net charge to make conservation meaningful
function makeTone(n: number): Int8Array {
  const t = new Int8Array(n)

  for (let i = 0; i < n; i++) {t[i] = ((i * 7 + 2) % 3) - 1} // values in {-1, 0, 1}

  return t
}

const charge = (t: Int8Array): number =>
  t.reduce((s: number, v) => s + v, 0)

const countSign = (t: Int8Array, s: number): number =>
  t.reduce((c: number, v) => c + (v === s ? 1 : 0), 0)

const { eu, ev } = ringEdges(N)

suite(
  'dynamics/conserving-sweep: charge conservation (every variant)',
  [
    check(
      'conservingEdgeSweep conserves total charge over many beats',
      () => {
        const tone = makeTone(N)
        const q0 = charge(tone)
        const moved = new Uint8Array(N)
        const rng = makeRng({ seed: 1 })

        for (let b = 0; b < 50; b++) {
          conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow: 0.2 })
          equal(charge(tone), q0, `charge at beat ${b}`)
        }
      },
    ),
    check('conservingEdgeSweepTunable conserves total charge', () => {
      const tone = makeTone(N)
      const q0 = charge(tone)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 2 })

      for (let b = 0; b < 40; b++) {
        conservingEdgeSweepTunable({
          tone,
          eu,
          ev,
          moved,
          rng,
          arrow: 0.3,
          share: 0.6,
          hop: 0.4,
        })
        equal(charge(tone), q0, `charge at beat ${b}`)
      }
    }),
    check(
      'conservingChainSweep and conservingRingSweep conserve charge',
      () => {
        const chain = makeTone(N)
        const q0 = charge(chain)
        const moved = new Uint8Array(N)
        const rng = makeRng({ seed: 3 })

        for (let b = 0; b < 30; b++) {
          conservingChainSweep({
            tone: chain,
            length: N,
            moved,
            rng,
            arrow: 0.25,
          })
          equal(charge(chain), q0, `chain charge at beat ${b}`)
        }

        const ringTone = makeTone(N)
        const q1 = charge(ringTone)

        for (let b = 0; b < 30; b++) {
          conservingRingSweep({
            tone: ringTone,
            length: N,
            start: b % N,
            moved,
            rng,
            arrow: 0.25,
          })
          equal(charge(ringTone), q1, `ring charge at beat ${b}`)
        }
      },
    ),
    check(
      'conservingRingSweepTunable and evolveConservingRing conserve charge',
      () => {
        const tone = makeTone(N)
        const q0 = charge(tone)
        const moved = new Uint8Array(N)
        const rng = makeRng({ seed: 4 })

        for (let b = 0; b < 30; b++) {
          conservingRingSweepTunable({
            tone,
            length: N,
            moved,
            rng,
            arrow: 0.2,
            share: 0.5,
            hop: 0.5,
          })
          equal(charge(tone), q0, `tunable ring charge at beat ${b}`)
        }

        const evolved = makeTone(N)
        const q1 = charge(evolved)
        evolveConservingRing({
          tone: evolved,
          beats: 25,
          arrow: 0.3,
          rng: makeRng({ seed: 5 }),
        })
        equal(
          charge(evolved),
          q1,
          'evolveConservingRing conserves charge',
        )
      },
    ),
    check(
      'conservingEdgeListSweep, steered, pumped, hashed all conserve charge',
      () => {
        const edges = edgeList(N)
        const list = makeTone(N)
        const qL = charge(list)
        const steered = makeTone(N)
        const qS = charge(steered)
        const pumped = makeTone(N)
        const qP = charge(pumped)
        const hashed = makeTone(N)
        const qH = charge(hashed)
        const moved = new Uint8Array(N)
        const rng = makeRng({ seed: 6 })
        const pumpField = Int32Array.from({ length: N }, (_, i) =>
          Math.abs(i - N / 2),
        )

        for (let b = 0; b < 30; b++) {
          conservingEdgeListSweep({
            tone: list,
            edges,
            moved,
            rng,
            arrow: 0.2,
          })
          conservingEdgeSweepSteered({
            tone: steered,
            eu,
            ev,
            moved,
            rng,
            distGoal: pumpField,
            towardSign: -1,
          })
          conservingEdgeListSweepPumped({
            tone: pumped,
            edges,
            moved,
            rng,
            arrow: 0.2,
            pump: pumpField,
          })
          conservingEdgeSweepHashed({
            tone: hashed,
            eu,
            ev,
            moved,
            beat: b,
            arrow: 0.2,
          })
          equal(charge(list), qL, `list charge ${b}`)
          equal(charge(steered), qS, `steered charge ${b}`)
          equal(charge(pumped), qP, `pumped charge ${b}`)
          equal(charge(hashed), qH, `hashed charge ${b}`)
        }
      },
    ),
  ],
)

suite('dynamics/conserving-sweep: sign counts and minting limits', [
  check('hop-only conserves the count of each sign separately', () => {
    const tone = makeTone(N)
    const plus0 = countSign(tone, 1)
    const minus0 = countSign(tone, -1)
    const moved = new Uint8Array(N)
    const rng = makeRng({ seed: 7 })

    for (let b = 0; b < 30; b++) {
      conservingHopSweep({ tone, eu, ev, moved, rng })
      equal(countSign(tone, 1), plus0, `+1 count at beat ${b}`)
      equal(countSign(tone, -1), minus0, `-1 count at beat ${b}`)
    }
  }),
  check(
    'onlyCreate cannot raise the net charge (mints balanced pairs)',
    () => {
      const tone = new Int8Array(N) // all peace, net charge 0
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 8 })

      for (let b = 0; b < 20; b++) {
        conservingEdgeSweep({
          tone,
          eu,
          ev,
          moved,
          rng,
          arrow: 0.5,
          onlyCreate: true,
        })
        equal(charge(tone), 0, `net charge stays 0 at beat ${b}`)
      }

      ok(countSign(tone, 1) > 0, 'pairs were minted (count rose)')
      equal(
        countSign(tone, 1),
        countSign(tone, -1),
        'minted pairs are balanced',
      )
    },
  ),
])

suite('dynamics/conserving-sweep: determinism and equivalences', [
  check('two runs with the same seed are bit-for-bit identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone(N)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 99 })

      for (let b = 0; b < 20; b++)
        {conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow: 0.3 })}

      return tone
    }

    exactArray(run(), run(), 'deterministic')
  }),
  check(
    'pump = null reproduces the unbiased edge-list sweep bit-for-bit',
    () => {
      const edges = edgeList(N)
      const a = makeTone(N)
      const b = makeTone(N)
      const movedA = new Uint8Array(N)
      const movedB = new Uint8Array(N)
      const rngA = makeRng({ seed: 21 })
      const rngB = makeRng({ seed: 21 })

      for (let t = 0; t < 20; t++) {
        conservingEdgeListSweep({
          tone: a,
          edges,
          moved: movedA,
          rng: rngA,
          arrow: 0.25,
        })
        conservingEdgeListSweepPumped({
          tone: b,
          edges,
          moved: movedB,
          rng: rngB,
          arrow: 0.25,
          pump: null,
        })
      }

      exactArray(a, b, 'pump=null == unbiased list sweep')
    },
  ),
  check('hashRand is deterministic and in [0, 1)', () => {
    for (const [k, beat, salt] of [
      [3, 1, 2],
      [10, 5, 0],
      [99, 7, 3],
    ] as const) {
      const v = hashRand(k, beat, salt)
      equal(v, hashRand(k, beat, salt), 'reproducible')
      ok(v >= 0 && v < 1, `in range (${v})`)
    }
  }),
])
