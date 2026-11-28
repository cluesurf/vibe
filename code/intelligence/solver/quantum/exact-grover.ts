/**
 * The exact Grover walk a quantum solver runs, carried inside the solver's
 * own bundle (Q7).
 *
 * Why it is not imported: the layer-2 walk (code/compute/quantum/walk.ts,
 * Q5) reaches code/rule/bare-beat and lives in the quantum lab, and a
 * candidate may reach neither: check:layers rule 2 forbids a candidate the
 * quantum lab and the rules, and the sandbox bundle refuses
 * any module outside the candidate folders. So the solver carries this
 * module, which imports nothing, and the experiment certifies it against
 * walk.ts beat for beat on graphs the evaluator builds itself.
 *
 * The walk is the one of Q5: the walker sits on an arc (state, slot), the
 * coin G = (2/d) J - I mixes a state's d arcs, the flip-flop shift sends the
 * arc (v -> w) to (w -> v), a slot with no neighbour is a reflecting wall,
 * and the oracle marks a state by the coin -I there (Ambainis-Kempe-Rivosh),
 * from the uniform state on every arc. One change: the oracle may mark a set
 * of states (a goal predicate accepts many), and the walk reads the
 * probability of the whole set.
 *
 * Exactness. G has entries in Z[1/6] exactly when 2/d does, so the degree is
 * the smallest d = 2^a 3^b at or above the graph's largest degree, the rest
 * of each state's slots being walls. Every amplitude is an integer x over
 * q^t with q = d / gcd(2, d), the uniform start has amplitude 1 per arc, and
 * every probability divides by the start weight d N: each is an exact
 * fraction of bigints, compared by cross-multiplication. No floating point,
 * no Math call, no random number.
 */

export interface WalkGraph {
  states: number
  degree: number
  /** reverse[a]: the arc the shift sends arc a to, a itself on a wall */
  reverse: Int32Array
  walls: number
}

/** An exact nonnegative fraction num / den, den > 0, not necessarily reduced. */
export interface Fraction {
  num: bigint
  den: bigint
}

function fail(message: string): never {
  throw new Error(`exact-grover: ${message}`)
}

/** The smallest d = 2^a 3^b with d >= max(2, largest): the least degree with an exact Grover coin above it. */
export function sixSmoothDegree(largest: number): number {
  if (!Number.isInteger(largest) || largest < 0) {
    fail(`a degree must be a nonnegative integer (got ${largest})`)
  }

  const floor = largest < 2 ? 2 : largest

  for (let d = floor; ; d++) {
    let rest = d

    while (rest % 2 === 0) {
      rest /= 2
    }

    while (rest % 3 === 0) {
      rest /= 3
    }

    if (rest === 1) {
      return d
    }
  }
}

/** Whether 2/d lies in Z[1/6], so the Grover coin of degree d is exact. */
export function exactCoin(degree: number): boolean {
  return Number.isInteger(degree) && degree >= 2 && sixSmoothDegree(degree) === degree
}

/**
 * The arc structure of an undirected graph whose every state has at most
 * `degree` neighbours. Fails closed on a self-loop, a repeated neighbour, an
 * asymmetric adjacency, a state above the degree or a degree with no exact
 * coin. Missing slots become walls.
 */
export function walkGraph(neighbors: readonly (readonly number[])[], degree: number): WalkGraph {
  if (!exactCoin(degree)) {
    fail(`degree ${degree} has no exact Grover coin: 2/${degree} is not in Z[1/6]`)
  }

  const states = neighbors.length
  const reverse = new Int32Array(states * degree)

  let walls = 0

  for (let v = 0; v < states; v++) {
    const row = neighbors[v]!

    if (row.length > degree) {
      fail(`state ${v} has ${row.length} neighbours, above degree ${degree}`)
    }

    if (new Set(row).size !== row.length) {
      fail(`state ${v} repeats a neighbour`)
    }

    for (let j = 0; j < degree; j++) {
      const a = v * degree + j

      if (j >= row.length) {
        reverse[a] = a
        walls++
        continue
      }

      const w = row[j]!

      if (w === v) {
        fail(`state ${v} is its own neighbour`)
      }

      const back = neighbors[w]?.indexOf(v) ?? -1

      if (back < 0) {
        fail(`state ${w} does not list its neighbour ${v}`)
      }

      reverse[a] = w * degree + back
    }
  }

  return { states, degree, reverse, walls }
}

/** -1, 0 or 1 as a < b, a = b, a > b. */
export function compareFractions(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const left = a.num * b.den
  const right = b.num * a.den

  return left < right ? -1 : left > right ? 1 : 0
}

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    const r = x % y

    x = y
    y = r
  }

  return x
}

/** The fraction in lowest terms. */
export function reduced(f: Fraction): Fraction {
  const g = gcd(f.num, f.den)

  return g === 0n ? { num: 0n, den: 1n } : { num: f.num / g, den: f.den / g }
}

/** The first-maximum cap of Q5: 4 isqrt(N log2 N) + 16 beats. */
export function searchCap(states: number): number {
  const bits = states.toString(2).length
  const target = states * bits

  let r = 0

  while ((r + 1) * (r + 1) <= target) {
    r++
  }

  return 4 * r + 16
}

/**
 * Bytes of magnitudes written in base 256 (at least 1 each), found by
 * comparing against powers of 256 from the last answer, which moves by at
 * most a step or two between neighbouring amplitudes.
 */
class ByteCounter {
  private powers: bigint[] = [1n, 256n]
  private guess = 1

  private power(k: number): bigint {
    while (this.powers.length <= k) {
      this.powers.push(this.powers[this.powers.length - 1]! * 256n)
    }

    return this.powers[k]!
  }

  /** the least k >= 1 with |x| < 256^k */
  bytes(x: bigint): number {
    const m = x < 0n ? -x : x

    let k = this.guess

    while (m >= this.power(k)) {
      k++
    }

    while (k > 1 && m < this.power(k - 1)) {
      k--
    }

    this.guess = k

    return k
  }
}

export interface WalkReading {
  states: number
  degree: number
  /** states the oracle marks */
  marked: number
  /** beats simulated */
  beats: number
  /** probability of the marked set after t beats, t = 0..beats */
  probability: Fraction[]
  /** beats whose total weight is not exactly q^(2t) d N */
  unitaryDefects: number
  /** the running maximum when the probability first falls below half of it, once it has reached twice the start */
  firstMaximumBeat: number | null
  firstMaximum: Fraction | null
  windowMaximumBeat: number
  windowMaximum: Fraction
  stoppedBy: 'firstMaximum' | 'cap' | 'bytes'
  /** the beat a measurement is made at: the first maximum, else the window maximum */
  measuredBeat: number
  measured: Fraction
  /** each marked state's weight (numerator over q^(2T) d N) at the measured beat, in state order of the marked list */
  markedWeights: bigint[]
  /** the marked states, ascending */
  markedStates: number[]
  /** the most bytes the amplitude numerators and their shared denominator held at once */
  amplitudeBytes: number
  /** arc updates made: beats times d N */
  arcUpdates: number
  /** states that ever held a nonzero amplitude */
  statesTouched: number
}

/**
 * The search walk: from the uniform state on every arc, coin (or -I on a
 * marked state when `oracle` holds) then shift, each beat, up to `cap` beats
 * or the first maximum, stopping early (`stoppedBy: 'bytes'`) before a beat
 * whose amplitudes could hold more than `byteLimit` bytes (a bound from the
 * current magnitudes, so the limit is never crossed). With `oracle` false the
 * walk is the free walk and the marked set is only read.
 */
export function walkSearch(input: {
  graph: WalkGraph
  marked: Uint8Array
  cap: number
  byteLimit?: number
  oracle?: boolean
  runToCap?: boolean
}): WalkReading {
  const { graph, marked, cap } = input
  const oracle = input.oracle ?? true
  const byteLimit = input.byteLimit ?? Number.POSITIVE_INFINITY
  const d = graph.degree
  const big = BigInt(d)
  const g = d % 2 === 0 ? 2n : 1n
  const q = big / g
  const c = 2n / g
  const arcs = graph.states * d
  const startWeight = BigInt(arcs)
  const markedStates: number[] = []

  if (marked.length !== graph.states) {
    fail(`the marked flags cover ${marked.length} states, the graph ${graph.states}`)
  }

  for (let v = 0; v < graph.states; v++) {
    if (marked[v] === 1) {
      markedStates.push(v)
    } else if (marked[v] !== 0) {
      fail(`marked flag ${marked[v]} at ${v} is not 0 or 1`)
    }
  }

  const twiceStart: Fraction = { num: BigInt(2 * markedStates.length), den: BigInt(graph.states) }
  const weightsOf = (x: readonly bigint[]): bigint[] =>
    markedStates.map(v => {
      let w = 0n

      for (let j = 0; j < d; j++) {
        const a = x[v * d + j]!

        w += a * a
      }

      return w
    })
  const sum = (values: readonly bigint[]): bigint => values.reduce((s, v) => s + v, 0n)

  let x: bigint[] = new Array<bigint>(arcs).fill(1n)
  let scaleSquared = 1n
  let scale = 1n
  let weights = weightsOf(x)

  const probability: Fraction[] = [{ num: sum(weights), den: startWeight }]

  let amplitudeBytes = arcs + 1
  let unitaryDefects = 0
  let runningMax = probability[0]!
  let runningMaxBeat = 0
  let runningWeights = weights
  let windowMax = probability[0]!
  let windowMaxBeat = 0
  let windowWeights = weights
  let firstMaximumBeat: number | null = null
  let firstMaximum: Fraction | null = null
  let firstWeights: bigint[] | null = null
  let stoppedBy: WalkReading['stoppedBy'] = 'cap'
  let beats = 0

  const counter = new ByteCounter()
  // the largest magnitude, in bytes, among each state's arcs: |c s - q x| <= (c d + q) max |x|, so the next beat's
  // amplitudes from state v take at most stateBytes[v] + growth bytes each, a bound checked before the beat is made
  const stateBytes = new Int32Array(graph.states).fill(1)
  const growth = counter.bytes(c * big + q)

  for (let t = 1; t <= cap; t++) {
    let bound = counter.bytes(scale) + growth

    for (let v = 0; v < graph.states; v++) {
      bound += d * (stateBytes[v]! + growth)
    }

    if (bound > byteLimit) {
      stoppedBy = 'bytes'
      break
    }

    const out = new Array<bigint>(arcs)

    for (let v = 0; v < graph.states; v++) {
      const base = v * d

      if (oracle && marked[v] === 1) {
        for (let j = 0; j < d; j++) {
          out[graph.reverse[base + j]!] = -q * x[base + j]!
        }

        continue
      }

      let s = 0n

      for (let j = 0; j < d; j++) {
        s += x[base + j]!
      }

      const cs = c * s

      for (let j = 0; j < d; j++) {
        out[graph.reverse[base + j]!] = cs - q * x[base + j]!
      }
    }

    x = out
    scale *= q
    scaleSquared *= q * q

    let bytes = counter.bytes(scale)
    let total = 0n

    for (let v = 0; v < graph.states; v++) {
      let top = 1

      for (let j = 0; j < d; j++) {
        const value = x[v * d + j]!
        const size = counter.bytes(value)

        bytes += size
        total += value * value

        if (size > top) {
          top = size
        }
      }

      stateBytes[v] = top
    }

    if (bytes > amplitudeBytes) {
      amplitudeBytes = bytes
    }

    beats = t

    if (total !== scaleSquared * startWeight) {
      unitaryDefects++
    }

    weights = weightsOf(x)

    const p: Fraction = { num: sum(weights), den: scaleSquared * startWeight }

    probability.push(p)

    if (compareFractions(p, windowMax) > 0) {
      windowMax = p
      windowMaxBeat = t
      windowWeights = weights
    }

    if (firstMaximumBeat === null) {
      if (compareFractions(p, runningMax) > 0) {
        runningMax = p
        runningMaxBeat = t
        runningWeights = weights
      } else if (
        compareFractions(runningMax, twiceStart) >= 0 &&
        compareFractions({ num: 2n * p.num, den: p.den }, runningMax) < 0
      ) {
        firstMaximumBeat = runningMaxBeat
        firstMaximum = runningMax
        firstWeights = runningWeights

        if (input.runToCap !== true) {
          stoppedBy = 'firstMaximum'
          break
        }
      }
    }
  }

  const measuredBeat = firstMaximumBeat ?? windowMaxBeat
  const measured = firstMaximum ?? windowMax

  return {
    states: graph.states,
    degree: d,
    marked: markedStates.length,
    beats,
    probability,
    unitaryDefects,
    firstMaximumBeat,
    firstMaximum,
    windowMaximumBeat: windowMaxBeat,
    windowMaximum: windowMax,
    stoppedBy,
    measuredBeat,
    measured,
    markedWeights: firstWeights ?? windowWeights,
    markedStates,
    amplitudeBytes,
    arcUpdates: beats * arcs,
    // the uniform start puts amplitude 1 on every arc, so every state is touched from beat 0
    statesTouched: graph.states,
  }
}
