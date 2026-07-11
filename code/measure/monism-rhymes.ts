import { conservingRingSweepTunable } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

// Structural-rhyme probes: three measurables suggested by monist emanation cosmologies (the shape a
// single substance unfolding by internal differentiation, a balancing triad, only balanced structure
// enduring, self-similar nesting). Each is settled here on the substrate's own conserving rule, with
// its own controls, and reported as it comes out (including where the tempting reading fails).

// The population standard deviation of the occupied cells (the spatial spread of a charge cluster);
// zero when a single cell is occupied, large when the cluster has dispersed.
export function chargeSpread(tone: Int8Array): number {
  let count = 0
  let sum = 0
  let sumSquares = 0

  for (let i = 0; i < tone.length; i++) {
    if (tone[i] !== 0) {
      count++
      sum += i
      sumSquares += i * i
    }
  }

  if (count === 0) return 0

  const mean = sum / count
  const variance = Math.max(0, sumSquares / count - mean * mean)

  return Math.sqrt(variance)
}

// The total absolute charge in a tone array.
export function totalCharge(tone: Int8Array): number {
  let sum = 0

  for (const t of tone) sum += Math.abs(t)

  return sum
}

// Evolve a cluster of `count` charges placed at the centre of a ring under the conserving rule with
// annihilation. When `balanced` the charges alternate sign (each has a partner to pair with); when
// not, they are all the same sign (no partner, cannot annihilate). Returns the final spread and the
// fraction of charge that annihilated.
export function evolveCluster(input: {
  length: number
  count: number
  beats: number
  balanced: boolean
  share: number
  seed: number
}): { finalSpread: number; annihilatedFraction: number } {
  const { length, count, beats, balanced, share, seed } = input
  const tone = new Int8Array(length)
  const start = Math.floor((length - count) / 2)

  for (let k = 0; k < count; k++)
    tone[start + k] = balanced ? (k % 2 ? 1 : -1) : 1

  const initialCharge = totalCharge(tone)
  const moved = new Uint8Array(length)
  const rng = makeRng({ seed })

  for (let t = 0; t < beats; t++) {
    conservingRingSweepTunable({
      tone,
      length,
      moved,
      rng,
      arrow: 0,
      share,
      hop: 0.5,
    })
  }

  const finalCharge = totalCharge(tone)

  return {
    finalSpread: chargeSpread(tone),
    annihilatedFraction: (initialCharge - finalCharge) / initialCharge,
  }
}

// The net charge trace (the signed sum over the ring) across the evolution of a tone configuration.
function netChargeTrace(input: {
  tone: Int8Array
  length: number
  beats: number
  share: number
  seed: number
  flipSink: boolean
}): number[] {
  const { tone, length, beats, share, seed, flipSink } = input
  const state = tone.slice()
  const moved = new Uint8Array(length)
  const rng = makeRng({ seed })
  const trace: number[] = []

  for (let t = 0; t < beats; t++) {
    conservingRingSweepTunable({
      tone: state,
      length,
      moved,
      rng,
      arrow: 0,
      share,
      hop: 0.5,
    })

    // a genuinely charge-asymmetric control rule: drain positive charge only (a give/restrain
    // asymmetry imposed by hand), used to show the measure detects asymmetry when it is present
    if (flipSink) {
      for (let i = 0; i < length; i++) {
        if (state[i] === 1 && i % 5 === 0) state[i] = 0
      }
    }

    let net = 0

    for (let i = 0; i < length; i++) net += state[i]!

    trace.push(net)
  }

  return trace
}

// The charge-conjugation asymmetry of the rule: run a configuration and its exact sign-flip, and
// measure the worst mismatch of net(x) plus net(-x) over the evolution. Zero means the rule treats
// plus and minus identically (no intrinsic give/restrain asymmetry in the base). The `asymmetric`
// flag imposes a hand-made positive-only sink, the control that the measure detects real asymmetry.
export function chargeConjugationAsymmetry(input: {
  length: number
  beats: number
  share: number
  seed: number
  asymmetric: boolean
}): number {
  const { length, beats, share, seed, asymmetric } = input
  const base = new Int8Array(length)
  const rng = makeRng({ seed: seed + 1 })

  for (let i = 0; i < length; i++) {
    const draw = rng.next()

    base[i] = draw < 0.2 ? 1 : draw < 0.4 ? -1 : 0
  }

  const flipped = base.map(value => -value) as Int8Array

  const traceBase = netChargeTrace({
    tone: base,
    length,
    beats,
    share,
    seed,
    flipSink: asymmetric,
  })

  const traceFlipped = netChargeTrace({
    tone: flipped,
    length,
    beats,
    share,
    seed,
    flipSink: asymmetric,
  })

  let worst = 0

  for (let t = 0; t < traceBase.length; t++)
    worst = Math.max(worst, Math.abs(traceBase[t]! + traceFlipped[t]!))

  return worst
}

// The block-average (coarse-graining) of a tone array into `length / block` cells.
export function blockAverage(tone: Int8Array, block: number): number[] {
  const cells = tone.length / block
  const coarse: number[] = []

  for (let i = 0; i < cells; i++) {
    let sum = 0

    for (let j = 0; j < block; j++) sum += tone[i * block + j]!

    coarse.push(sum)
  }

  return coarse
}

// The nested-garment identity check. A fine tone state is coarse-grained into nested garments (each
// exactly the block-average of the finer), and its identity (the total charge) is tracked through
// the evolution. The self wears nested garments (each garment is exactly the block-sum of the finer,
// so the coarser wears the finer), and its identity is retained across time only because the rule
// conserves. A leak (charges vanishing) dissolves the identity: the total charge drops. Returns the
// worst wearing error (a coarse garment failing to equal the block-sum of the finer, before and after
// evolution) and the identity-retained fraction (final total charge over initial, one under
// conservation, less than one under a leak).
export function nestedGarmentIdentity(input: {
  length: number
  blocks: number[]
  beats: number
  leak: number
  seed: number
}): { worstWearingError: number; identityRetained: number } {
  const { length, blocks, beats, leak, seed } = input
  const rng = makeRng({ seed })
  const tone = new Int8Array(length)

  for (let i = 0; i < length; i++) {
    const draw = rng.next()

    tone[i] = draw < 0.15 ? 1 : draw < 0.3 ? -1 : 0
  }

  const initialCharge = totalCharge(tone)
  const moved = new Uint8Array(length)
  const stepRng = makeRng({ seed: seed + 1 })

  let worstWearingError = 0

  const measureWearing = (): void => {
    for (let level = 1; level < blocks.length; level++) {
      const fineBlock = blocks[level - 1]!
      const coarseBlock = blocks[level]!
      const ratio = coarseBlock / fineBlock
      const finer = blockAverage(tone, fineBlock)
      const coarser = blockAverage(tone, coarseBlock)

      for (let i = 0; i < coarser.length; i++) {
        let sum = 0

        for (let j = 0; j < ratio; j++) sum += finer[i * ratio + j]!

        worstWearingError = Math.max(
          worstWearingError,
          Math.abs(sum - coarser[i]!),
        )
      }
    }
  }

  // each garment exactly wears the finer, before evolution
  measureWearing()

  for (let t = 0; t < beats; t++) {
    conservingRingSweepTunable({
      tone,
      length,
      moved,
      rng: stepRng,
      arrow: 0,
      share: 0,
      hop: 0.5,
    })

    if (leak > 0) {
      for (let i = 0; i < length; i++) {
        if (tone[i] !== 0 && stepRng.next() < leak) tone[i] = 0
      }
    }
  }

  // still wears exactly after evolution
  measureWearing()

  return {
    worstWearingError,
    identityRetained: totalCharge(tone) / initialCharge,
  }
}
