import { conservingRingSweepTunable } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

// Conservation as a stabilizer check. A stabilizer check in quantum error correction is an
// observable the encoded dynamics commutes with: it stays fixed under every legal evolution, so
// any change in it is a syndrome, the fingerprint of an error. The substrate's conserving
// transport preserves the total charge exactly, so the total charge is such a check: it never
// moves under the rule, a single-site error moves it, and the syndrome persists (the rule cannot
// erase it). A leaky rule does not conserve the check, so the syndrome fires without any error
// and detection is lost.

// Run the conserving transport on a charge blob, optionally injecting a single-site error (one
// stray tone flip on a rest cell) at `errorBeat`, under a tunable leak. Returns the first beat at
// which the total-charge check differs from its reference (-1 if the syndrome never fires).
export function syndromeFirstFires(input: {
  length: number
  blobStart: number
  blobEnd: number
  beats: number
  errorBeat: number | null
  leak: number
  seed: number
}): number {
  const { length, blobStart, blobEnd, beats, errorBeat, leak, seed } =
    input

  const tone = new Int8Array(length)

  for (let i = blobStart; i < blobEnd; i++) tone[i] = 1

  const moved = new Uint8Array(length)
  const rng = makeRng({ seed })
  const reference = blobEnd - blobStart

  let detectedAt = -1

  for (let t = 0; t < beats; t++) {
    conservingRingSweepTunable({
      tone,
      length,
      moved,
      rng,
      arrow: 0,
      share: 0,
      hop: 0.5,
    })

    if (leak > 0) {
      for (let i = 0; i < length; i++) {
        if (tone[i] !== 0 && rng.next() < leak) tone[i] = 0
      }
    }

    if (errorBeat !== null && t === errorBeat) {
      // the single-site error: one stray tone flip on a rest cell
      for (let i = 0; i < length; i++) {
        if (tone[i] === 0) {
          tone[i] = 1
          break
        }
      }
    }

    let charge = 0

    for (let i = 0; i < length; i++) charge += Math.abs(tone[i]!)

    if (charge !== reference && detectedAt < 0) detectedAt = t
  }

  return detectedAt
}
