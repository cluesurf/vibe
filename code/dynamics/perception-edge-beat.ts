// One beat of the perception rule on an edge list, dispatching between the cohesive sweep (company-driven
// hops, so blobs form, annihilating opposite tones with a temperature escape) and the plain conserving
// sweep (unconditional hop). Both mint pairs at the arrow probability. The single switch the scale
// experiments share so the rule body lives in one place.

import { cohesiveEdgeSweep } from '@/code/dynamics/cohesive-sweep'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import type { Rng } from '@/code/tool/rng'

export function perceptionEdgeBeat(input: {
  tone: Int8Array
  eu: Int32Array
  ev: Int32Array
  offsets: Int32Array
  adj: Int32Array
  moved: Uint8Array
  rng: Rng
  arrow: number
  cohesive: boolean
  temperature: number
}): void {
  const {
    tone,
    eu,
    ev,
    offsets,
    adj,
    moved,
    rng,
    arrow,
    cohesive,
    temperature,
  } = input
  if (cohesive) {
    cohesiveEdgeSweep({
      tone,
      eu,
      ev,
      offsets,
      adj,
      moved,
      rng,
      annihilate: true,
      arrow,
      escapeProbability: temperature,
    })
  } else {
    conservingEdgeSweep({ tone, eu, ev, moved, rng, arrow })
  }
}
