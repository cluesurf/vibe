import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'

// Discrete radiation-pressure (Casimir-shadow) attraction, the reversible binding-by-radiation mechanism, fully
// discrete (integer tone counts, integer momentum, no real numbers). A line of cells, each with two directed slots
// (a 1D coin, +x and -x), carries vacuum tones (unit charges streaming at one speed). A BODY models vacuum
// exclusion by mass, it zeros the tones in its span, so tones streaming from beyond it are ABSORBED and cast a
// SHADOW of reduced flux on the far side. A test mass counts the net integer momentum of the tones at its cell, and
// recoils when the accumulated momentum crosses a threshold (a heavy mass). Because the body shadows the flux on its
// side, the test mass is struck more from the open side, a net push TOWARD the body, the correct-sign attraction.
//
// Reversibility, the streaming is an exact bijection (shift), the ONLY irreversibility is absorption at the body and
// the open boundary (radiation reaching the bath), exactly where the model already quarantines it. So this is
// binding-by-radiation, reversible in the bulk, discrete throughout. The +x slot holds a +1 tone, the -x slot a -1
// tone, the empty slot 0, so the state is the ternary tone on a directed coin, the same primitive as the base.

export interface ShadowPressureResult {
  drift: number // net displacement of the test mass (negative = toward the body = attraction)
  netMomentum: number // running sum of integer momentum flux at the mass after warmup (negative = toward body)
  hitsRight: number // total +x tones counted at the mass (the shadowed side when a body is present)
  hitsLeft: number // total -x tones counted at the mass (the open side)
}

// Simulate the discrete shadow pressure. Right-movers (+1 tones) are sourced at x=0 (behind the body), left-movers
// (-1 tones) at x=length-1 (the open far side). With `body`, the span [bodyLo, bodyHi) absorbs all tones (vacuum
// exclusion), shadowing the right-movers so fewer reach the mass. Without `body`, the flux is symmetric (the
// control, no drift). The mass recoils one cell when |accumulated momentum| reaches `threshold`.
export function shadowPressureRun(input: {
  length: number
  massStart: number
  bodyLo: number
  bodyHi: number
  beats: number
  threshold: number
  body: boolean
}): ShadowPressureResult {
  const { length, massStart, bodyLo, bodyHi, beats, threshold, body } =
    input
  let right = new Int32Array(length) // +1 tones (moving +x)
  let left = new Int32Array(length) // -1 tones (moving -x)
  let mass = massStart
  let momentum = 0
  let netMomentum = 0
  let hitsRight = 0
  let hitsLeft = 0
  for (let t = 0; t < beats; t++) {
    // stream, the reversible bijection (each tone shifts one cell along its direction)
    const nextRight = new Int32Array(length)
    const nextLeft = new Int32Array(length)
    for (let x = 0; x < length; x++) {
      if (right[x]! && x + 1 < length) {
        nextRight[x + 1] = nextRight[x + 1]! + right[x]!
      }
      if (left[x]! && x - 1 >= 0) {
        nextLeft[x - 1] = nextLeft[x - 1]! + left[x]!
      }
    }
    right = nextRight
    left = nextLeft
    // the body excludes the vacuum (absorbs), the only irreversibility, the shadow
    if (body) {
      for (let x = bodyLo; x < bodyHi; x++) {
        right[x] = 0
        left[x] = 0
      }
    }
    // steady deterministic sources, one tone per beat from each side
    right[0] = right[0]! + 1
    left[length - 1] = left[length - 1]! + 1
    // measure the integer momentum flux at the mass cell
    const flux = right[mass]! - left[mass]!
    hitsRight += right[mass]!
    hitsLeft += left[mass]!
    if (t > beats / 2) {
      netMomentum += flux
    }
    // the heavy mass recoils one cell on an integer momentum threshold (discrete recoil)
    momentum += flux
    if (momentum >= threshold && mass < length - 2) {
      mass += 1
      momentum = 0
    } else if (momentum <= -threshold && mass > bodyHi + 1) {
      mass -= 1
      momentum = 0
    }
  }
  return { drift: mass - massStart, netMomentum, hitsRight, hitsLeft }
}

// The shadow-pressure attraction realized NATIVELY on the {3,4,3,4} geometry, the 24-direction D4 coin with its true
// root vectors. A body slab (x in [bodyLoX, bodyHiX)) excludes the vacuum (absorbs the tones streaming into it), so
// the +x-moving tones are absorbed before reaching the far side, a SHADOW. The net x-momentum at a test plane behind
// the body therefore points TOWARD the body (negative x) = attraction. Fully discrete, the state is the ternary tone
// {-1,0,+1} on each of the 24 directed slots per cell, the momentum is the exact integer sum of the present tones'
// root vectors. Returns the mean net x-momentum at the test plane (negative = toward the body). With `body` false it
// is the symmetric control (no shadow, zero net momentum).
export function shadowPressureD4(input: {
  side: number
  beats: number
  bodyLoX: number
  bodyHiX: number
  testX: number
  body: boolean
}): number {
  const { side, beats, bodyLoX, bodyHiX, testX, body } = input
  const mesh = d4Mesh({ side })
  const roots = rootsD4() as number[][]
  const cellCount = mesh.cellCount
  const degree = 24
  const xOf = (c: number): number => c % side
  const isBody = (c: number): boolean =>
    body && xOf(c) >= bodyLoX && xOf(c) < bodyHiX
  let data = new Int8Array(cellCount * degree)
  for (let c = 0; c < cellCount; c++) {
    if (isBody(c)) {
      continue
    }
    for (let d = 0; d < degree; d++) {
      data[c * degree + d] = 1
    }
  }
  for (let t = 0; t < beats; t++) {
    const out = new Int8Array(cellCount * degree)
    for (let c = 0; c < cellCount; c++) {
      for (let d = 0; d < degree; d++) {
        const src = mesh.neighbour(c, mesh.opposite(d))
        out[c * degree + d] = data[src * degree + d]!
      }
    }
    data = out
    for (let c = 0; c < cellCount; c++) {
      if (isBody(c)) {
        for (let d = 0; d < degree; d++) {
          data[c * degree + d] = 0
        }
      }
    } // vacuum exclusion (the only irreversibility)
    for (let c = 0; c < cellCount; c++) {
      const x = xOf(c)
      if ((x === 0 || x === side - 1) && !isBody(c)) {
        for (let d = 0; d < degree; d++) {
          data[c * degree + d] = 1
        }
      }
    } // steady source layers
  }
  let netX = 0
  let count = 0
  for (let c = 0; c < cellCount; c++) {
    if (xOf(c) !== testX) {
      continue
    }
    let mx = 0
    for (let d = 0; d < degree; d++) {
      mx += data[c * degree + d]! * (roots[d]![0] ?? 0)
    }
    netX += mx
    count++
  }
  return count ? netX / count : 0
}

// The FINAL INTEGRATION, a self-contained body bound by the shadow of its OWN active vacuum, on the {3,4,3,4} coin.
// No external injection, the vacuum is self-generated by the create move (every empty line brings out a zero-momentum
// pair, a tone on a direction and its opposite). The tones propagate and annihilate head-on, the body excludes the
// vacuum (absorbs), and the open boundary absorbs (the bath). Because the create move makes ZERO-momentum pairs, it
// cannot refill the momentum imbalance, only the body's absorption sets a net momentum, which points TOWARD the body
// (the +x-movers that would pass through the body are absorbed, a shadow). So a self-contained body holds itself by
// the radiation pressure of its own vacuum, reversibly (streaming is a bijection, the only irreversibility is the
// body and the open boundary). Fully discrete, occupancy tones on the 24 directed slots, exact integer momentum.
// Returns the mean net x-momentum at the test plane (negative = toward the body = the restoring force).
export function selfContainedShadowD4(input: {
  side: number
  beats: number
  bodyLoX: number
  bodyHiX: number
  testX: number
  body: boolean
}): number {
  const { side, beats, bodyLoX, bodyHiX, testX, body } = input
  const mesh = d4Mesh({ side })
  const roots = rootsD4() as number[][]
  const cellCount = mesh.cellCount
  const degree = 24
  const xOf = (c: number): number => c % side
  const isBody = (c: number): boolean =>
    body && xOf(c) >= bodyLoX && xOf(c) < bodyHiX
  let occ = new Uint8Array(cellCount * degree)
  for (let t = 0; t < beats; t++) {
    // self-generated active vacuum, the create move brings out a zero-momentum pair on every empty line
    for (let c = 0; c < cellCount; c++) {
      if (isBody(c)) {
        continue
      }
      for (let d = 0; d < degree; d++) {
        const o = mesh.opposite(d)
        if (
          d < o &&
          occ[c * degree + d] === 0 &&
          occ[c * degree + o] === 0
        ) {
          occ[c * degree + d] = 1
          occ[c * degree + o] = 1
        }
      }
    }
    // stream, the reversible bijection
    const next = new Uint8Array(cellCount * degree)
    for (let c = 0; c < cellCount; c++) {
      for (let d = 0; d < degree; d++) {
        const src = mesh.neighbour(c, mesh.opposite(d))
        next[c * degree + d] = occ[src * degree + d]!
      }
    }
    occ = next
    // annihilate head-on pairs (a tone met its opposite), the active-vacuum's annihilate half
    for (let c = 0; c < cellCount; c++) {
      for (let d = 0; d < degree; d++) {
        const o = mesh.opposite(d)
        if (d < o && occ[c * degree + d] && occ[c * degree + o]) {
          occ[c * degree + d] = 0
          occ[c * degree + o] = 0
        }
      }
    }
    // the body excludes the vacuum, the open boundary absorbs (the bath), the only irreversibility
    for (let c = 0; c < cellCount; c++) {
      const x = xOf(c)
      if (isBody(c) || x === 0 || x === side - 1) {
        for (let d = 0; d < degree; d++) {
          occ[c * degree + d] = 0
        }
      }
    }
  }
  let netX = 0
  let count = 0
  for (let c = 0; c < cellCount; c++) {
    if (xOf(c) !== testX) {
      continue
    }
    let mx = 0
    for (let d = 0; d < degree; d++) {
      mx += occ[c * degree + d]! * (roots[d]![0] ?? 0)
    }
    netX += mx
    count++
  }
  return count ? netX / count : 0
}

// The 1D shadow well field, the net inward momentum a centered absorbing body casts. Returns nm[x] = (right-movers
// minus left-movers) at each cell, negative on the body's right side (inward), positive on its left. Used to test
// whether the well confines a moving body without a rest slot.
export function shadowWellField1D(input: {
  length: number
  center: number
  bodyHalfWidth: number
  beats: number
}): Int32Array {
  const { length, center, bodyHalfWidth, beats } = input
  let right = new Int32Array(length)
  let left = new Int32Array(length)
  const bodyLo = center - bodyHalfWidth,
    bodyHi = center + bodyHalfWidth + 1
  for (let t = 0; t < beats; t++) {
    const r2 = new Int32Array(length),
      l2 = new Int32Array(length)
    for (let x = 0; x < length; x++) {
      if (right[x]! && x + 1 < length) {
        r2[x + 1] = r2[x + 1]! + right[x]!
      }
      if (left[x]! && x - 1 >= 0) {
        l2[x - 1] = l2[x - 1]! + left[x]!
      }
    }
    right = r2
    left = l2
    for (let x = bodyLo; x < bodyHi; x++) {
      right[x] = 0
      left[x] = 0
    }
    right[0] = right[0]! + 1
    left[length - 1] = left[length - 1]! + 1
  }
  const nm = new Int32Array(length)
  for (let x = 0; x < length; x++) {
    nm[x] = right[x]! - left[x]!
  }
  return nm
}

// Test whether a test tone is CONFINED by a well field, starting at `center + startOffset` moving outward. A
// SINGLE-SPEED tone always moves (|v|=1) and reverses when the inward push accumulates past `mass`, a REST-capable
// tone may stop (v=0). Returns the max excursion and whether it ESCAPED to the boundary (not bound). This decides
// whether the shadow well needs a rest slot, if single-speed stays bound at short range, the rest slot is optional.
export function confineInWell(input: {
  field: Int32Array
  length: number
  center: number
  startOffset: number
  singleSpeed: boolean
  mass: number
  beats: number
}): { maxExcursion: number; escaped: boolean } {
  const {
    field,
    length,
    center,
    startOffset,
    singleSpeed,
    mass,
    beats,
  } = input
  let p = center + startOffset
  let v = 1
  let m = 0
  let maxExc = startOffset
  for (let t = 0; t < beats; t++) {
    m += field[p] ?? 0
    if (singleSpeed) {
      if (m <= -mass) {
        v = -1
        m = 0
      } else if (m >= mass) {
        v = 1
        m = 0
      }
      p += v
    } else {
      if (m <= -mass) {
        p -= 1
        m = 0
      } else if (m >= mass) {
        p += 1
        m = 0
      }
    }
    const exc = p - center
    if (exc > maxExc) {
      maxExc = exc
    }
    if (p <= center + 2 || p >= length - 2) {
      return { maxExcursion: maxExc, escaped: p >= length - 2 }
    }
  }
  return { maxExcursion: maxExc, escaped: false }
}
