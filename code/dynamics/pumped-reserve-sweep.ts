import { Rng } from '@/code/tool/rng'

// One beat of conserved hops over an edge list with a self-vs-field PUMP/LEAK structure (the
// "willpower reserve" dynamics). Each edge with exactly one neutral and one charged endpoint is a
// hop candidate; whether the charge hops depends on where the edge sits relative to a marked self:
//   - interior (both endpoints in the self) and pump on: the field penetrates with probability
//     `fieldLeak` (a disordering coin), otherwise the self PUMPS the charge toward the centre
//     (a positive charge moves to the smaller distC, a negative to the larger),
//   - crossing (the edge straddles the self boundary) and pump on: the field DRAINS charge across
//     with probability `fieldLeak`,
//   - exterior, or pump off everywhere: an unbiased random walk (rng.next() < 1/2).
// `inSelf[i] === 1` marks self cells, `distC` is the hop distance to the self centre, `farValue` the
// value for cells missing from distC. Every swap preserves the pair sum, so net charge is conserved.
export function pumpedReserveSweep(input: {
  tone: Int8Array
  edges: ReadonlyArray<readonly [number, number]>
  inSelf: Uint8Array
  distC: Int32Array
  rng: Rng
  fieldLeak: number
  pump: boolean
  farValue?: number
}): void {
  const { tone, edges, inSelf, distC, rng, fieldLeak, pump } = input
  const far = input.farValue ?? 1e9
  const dd = (i: number): number => distC[i] ?? far
  const moved = new Uint8Array(tone.length)
  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) {
      continue
    }

    const tv = tone[v]!
    const tw = tone[w]!
    let c = -1
    let e = -1
    if (tv === 0 && tw !== 0) {
      e = v
      c = w
    } else if (tw === 0 && tv !== 0) {
      e = w
      c = v
    } else {
      continue
    }

    const crossing = inSelf[v] !== inSelf[w]
    const interior = inSelf[v] === 1 && inSelf[w] === 1
    let swap = false
    if (pump && interior) {
      if (rng.next() < fieldLeak) {
        swap = rng.next() < 0.5
      } else {
        swap = tone[c]! > 0 ? dd(e) < dd(c) : dd(e) > dd(c)
      }
    } else if (pump && crossing) {
      swap = rng.next() < fieldLeak
    } else {
      swap = rng.next() < 0.5
    }

    if (swap) {
      tone[e] = tone[c]!
      tone[c] = 0
      moved[v] = 1
      moved[w] = 1
    }
  }
}
