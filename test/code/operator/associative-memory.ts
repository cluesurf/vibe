// Conformance for code/operator/associative-memory: Potter's SITDAC content-addressable
// memory on a cell graph. Facts:
//   - ternaryWord produces distinct words with slots in {0,1,2}.
//   - storeWord/readWord round-trip exactly.
//   - matchScore, search, searchExact, searchBest match an independent brute-force scan.
//   - comparedSlots respects the mask.
//   - broadcastWave arrival beats equal graph distance; pickNearest picks the nearest.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  readWord,
  comparedSlots,
  matchScore,
  search,
  searchExact,
  searchBest,
  pickNearest,
  broadcastWave,
} from '@/code/operator/associative-memory'

const wordBits = 21

// A line of 8 cells: neighbours[i] = [i-1, i+1].
const line: number[][] = Array.from({ length: 8 }, (_, i) =>
  [i - 1, i + 1].filter(j => j >= 0 && j < 8),
)

function freshMemory(): ReturnType<typeof makeAssociativeMemory> {
  const mem = makeAssociativeMemory({ neighbors: line, wordBits })

  for (let c = 0; c < mem.cellCount; c++) {
    storeWord(mem, c, ternaryWord(c * 7 + 1, wordBits))
  }

  return mem
}

suite('operator/associative-memory: words', [
  check('ternaryWord has slots in {0,1,2} and distinct words', () => {
    const words = Array.from({ length: 20 }, (_, i) =>
      ternaryWord(i, wordBits),
    )

    for (const w of words) {
      for (const slot of w) {
        ok(
          slot === 0 || slot === 1 || slot === 2,
          'slot is a base-3 digit',
        )
      }
    }

    const keys = new Set(words.map(w => w.join('')))
    equal(keys.size, words.length, 'all words distinct')
  }),
  check('storeWord then readWord round-trips', () => {
    const mem = makeAssociativeMemory({ neighbors: line, wordBits })
    const w = ternaryWord(42, wordBits)
    storeWord(mem, 3, w)

    const back = readWord(mem, 3)
    ok(
      back.every((v, k) => v === w[k]),
      'read recovers the stored word',
    )
    equal(mem.occupied[3], 1, 'cell marked occupied')
  }),
  check('comparedSlots counts the unmasked slots', () => {
    equal(comparedSlots(wordBits), wordBits, 'all slots without a mask')

    const mask = new Int8Array(wordBits)
    mask[0] = 1
    mask[5] = 1
    mask[20] = 1
    equal(
      comparedSlots(wordBits, mask),
      3,
      'mask restricts to three slots',
    )
  }),
])

suite('operator/associative-memory: search', [
  check('matchScore is wordBits for an exact match', () => {
    const mem = freshMemory()
    const w = readWord(mem, 4)
    equal(
      matchScore(mem, 4, w),
      wordBits,
      'a cell matches its own word fully',
    )
    ok(
      matchScore(mem, 4, ternaryWord(999999, wordBits)) < wordBits,
      'a foreign word scores lower',
    )
  }),
  check(
    'searchExact returns exactly the cells matching the comparand',
    () => {
      const mem = freshMemory()
      const target = readWord(mem, 5)
      const responders = searchExact({ mem, comparand: target })
      // brute-force reference: cells whose stored word equals target.
      const reference: number[] = []

      for (let c = 0; c < mem.cellCount; c++) {
        if (readWord(mem, c).every((v, k) => v === target[k])) {
          reference.push(c)
        }
      }

      equal(
        responders.join(','),
        reference.join(','),
        'responder set matches brute force',
      )
      ok(responders.includes(5), 'cell 5 is a responder')
    },
  ),
  check('searchBest returns the highest-scoring occupied cell', () => {
    const mem = freshMemory()
    const target = readWord(mem, 6)
    const { cell, score } = searchBest({ mem, comparand: target })
    equal(cell, 6, 'the exact owner is the best responder')
    equal(score, wordBits, 'full score')
  }),
  check('a minScore threshold matches a brute-force scan', () => {
    const mem = freshMemory()
    const comparand = ternaryWord(123, wordBits)
    const minScore = 10
    const responders = search({
      mem,
      comparand,
      mask: undefined,
      minScore,
    })

    const reference: number[] = []

    for (let c = 0; c < mem.cellCount; c++) {
      if (matchScore(mem, c, comparand) >= minScore) {
        reference.push(c)
      }
    }

    equal(
      responders.join(','),
      reference.join(','),
      'threshold search matches brute force',
    )
  }),
])

suite('operator/associative-memory: broadcast', [
  check('arrival beats equal graph distance from the seed', () => {
    const responders = [2, 6]
    const wave = broadcastWave({ neighbors: line, seed: 0, responders })

    for (let c = 0; c < line.length; c++) {
      equal(
        wave.arrivalBeat[c],
        c,
        `cell ${c} reached at distance ${c} on a line from end`,
      )
    }

    equal(
      wave.firstResponderBeat,
      2,
      'nearest responder (cell 2) reached at beat 2',
    )
    equal(wave.coverageBeat, 7, 'farthest cell reached at beat 7')
  }),
  check('pickNearest selects the responder nearest the seed', () => {
    const nearest = pickNearest({
      responders: [5, 2, 7],
      seed: 0,
      neighbors: line,
    })

    equal(nearest, 2, 'cell 2 is the graph-nearest responder')
  }),
])
