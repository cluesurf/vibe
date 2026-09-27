// Distance as shared information, read on the husk of the adopted knit (E-GRV-0064, E-GRV-0065). A pure READING of the
// existing dynamics: nothing in the rule is changed or added.
//
// THE IDEA (Van Raamsdonk, the emergent-geometry-from-entanglement route): two regions are close when they share much
// information. Here the regions are husk columns (the column sum along the depth, the finest husk block there is), and the
// information is the one the knit's own exact dynamics puts between them.
//
// THE ENSEMBLE. The knit is deterministic, so a mutual information needs an ensemble. It is the fixed 17-member start
// family (code/measure/start-ensemble: the link start integer+0 .. integer+15 and golden) with the gas fill of Weyl phase
// k for member k (code/measure/held-knot knotStart, the same gas E-GRV-0056 used). Nothing is drawn.
//
// WHY THE KNIT AND NOT THE SIGNED QUANTUM STATE. The signed net-count Born rule (E-QTM-0130, 0142) lives on the sum
// records, whose states hold no husk geometry, and the knit cannot bind a knot (E-SPN-0067), so there is no quantum knot
// to read. The knit's exact dynamics is the one place both a husk and a (held) knot exist.
//
// THE MUTUAL INFORMATION, the simplest standard form. The reading of column c at beat t in member m is its conserved
// energy E (held slots + 2 per stored unit, code/measure/held-knot columnEnergy). Its fluctuation is dE = E - (the mean
// over the 17 members at the same beat and column), which removes everything the members share (the vacuum's own
// deterministic cycle). The correlation of two columns a, b is
//   rho = sum dE_a dE_b / sqrt(sum dE_a^2 sum dE_b^2)
// summed over members and settled beats (and, where the reading is translation invariant, over origins and the images of a
// displacement under the husk's sign and axis symmetries). The Gaussian mutual information of two scalars with that
// correlation is I = -1/2 ln(1 - rho^2) nats. Why Gaussian: each reading is a sum over 16 docks and 16 x 48 slot and store
// trits, so its law is near normal, and a histogram estimator on 17 members would be dominated by its own bias. The sign of
// rho is dropped by the square, so the reading is charge blind by construction.
//
// ERRORS. Jackknife over the 17 members (leave one member's sums out; the member mean is the full ensemble's).
//
// THE MESH DISTANCE of the husk. One beat of the stream moves a slot one dock along its root, which moves its husk column
// by (r1, r2, r3): an axis step (+-e_i) or a face-diagonal step (+-e_i +- e_j). The graph distance of Z^3 with those steps
// is max(|d|_inf, ceil(|d|_1 / 2)), the husk's light-cone distance.
//
// Reals appear only here, in the readers. DETERMINISM: Weyl fills and the 17 link starts.

import { chargeOf, energyOf, type ArrowBox } from '@/code/measure/second-law-husk'
import { columnEnergy, columnPosition, knotRunner, ring, type KnotStream } from '@/code/measure/held-knot'
import { type Reduced } from '@/code/measure/living-pair-kernel'

// the husk's graph distance for a column displacement (axis and face-diagonal steps)
export function meshDistance(d: readonly number[]): number {
  const a = d.map(Math.abs)
  const inf = Math.max(...a)
  const one = a.reduce((x, y) => x + y, 0)

  return Math.max(inf, Math.ceil(one / 2))
}

export function gaussianInformation(rho: number): number {
  return -0.5 * Math.log(1 - rho * rho)
}

// the jackknife over members of a statistic of per-member sums: `sums[m]` is member m's vector of sums, `stat` reads a
// total vector. Returns the full-ensemble value and its jackknife standard error.
export function jackknife(sums: readonly Float64Array[], stat: (total: Float64Array) => number): { value: number; error: number } {
  const m = sums.length
  const n = (sums[0] as Float64Array).length
  const total = new Float64Array(n)

  for (const s of sums) for (let i = 0; i < n; i++) total[i] = (total[i] as number) + (s[i] as number)

  const value = stat(total)
  const leave = sums.map(s => stat(Float64Array.from(total, (x, i) => x - (s[i] as number))))
  const mean = leave.reduce((a, b) => a + b, 0) / m
  const error = Math.sqrt(((m - 1) / m) * leave.reduce((a, b) => a + (b - mean) ** 2, 0))

  return { value, error }
}

// ---- recording: the column energies of one run, beat by beat ----

export type Recording = {
  // energies[t] is the column energy at settled beat settle + 1 + t (length side^3), Int16 (at most 16 x 48 per column)
  readonly energies: Int16Array[]
  // energy and charge the same at every beat
  readonly exact: boolean
  // every held (knot) slot, point and store the same at the last beat as at the start
  readonly heldSame: boolean
}

// every slot, role point, store trit and store point outside the knot the same in a and b
export function sameOutside(k: KnotStream, a: Reduced, b: Reduced): boolean {
  for (let x = 0; x < k.box.cells; x++) {
    if (k.held[x]) continue

    for (let d = 0; d < 24; d++) {
      const i = x * 24 + d

      if (a.vibe[i] !== b.vibe[i] || (a.vibe[i] !== 0 && a.point[i] !== b.point[i])) return false
    }

    for (let l = 0; l < 12; l++) {
      const i = x * 12 + l

      if (a.store[i] !== b.store[i] || (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])) return false
    }
  }

  return true
}

// run the starts together under the stream `k` for settle + samples beats and record each one's settled column energies.
// Also counts the beats on which every start's outside (sameOutside) equals the first start's.
export function recordLockstep(k: KnotStream, starts: readonly Reduced[], settle: number, samples: number): { recordings: Recording[]; outsideSameBeats: number } {
  const box = k.box
  const runners = starts.map(s => knotRunner(k, s))
  const energy = starts.map(energyOf)
  const charge = starts.map(chargeOf)
  const scratch = new Float64Array(box.side ** 3)
  const energies: Int16Array[][] = starts.map(() => [])
  const exact = starts.map(() => true)
  let outsideSameBeats = 0

  for (let t = 1; t <= settle + samples; t++) {
    runners.forEach((r, i) => {
      r.forward()

      const s = r.state()

      exact[i] = (exact[i] as boolean) && energyOf(s) === energy[i] && chargeOf(s) === charge[i]

      if (t > settle) {
        const list = energies[i] as Int16Array[]

        columnEnergy(box, s, scratch)
        list.push(Int16Array.from(scratch))
      }
    })

    const first = (runners[0] as (typeof runners)[number]).state()

    if (runners.length === 1 || runners.every(r => sameOutside(k, r.state(), first))) outsideSameBeats++
  }

  const recordings = runners.map((r, i): Recording => {
    const s = r.state()
    const start = starts[i] as Reduced
    let heldSame = true

    for (let x = 0; x < box.cells && heldSame; x++) {
      if (!k.held[x]) continue

      for (let d = 0; d < 24; d++) {
        const j = x * 24 + d

        if (s.vibe[j] !== start.vibe[j] || (s.vibe[j] !== 0 && s.point[j] !== start.point[j])) heldSame = false
      }

      for (let l = 0; l < 12; l++) if (s.store[x * 12 + l] !== start.store[x * 12 + l]) heldSame = false
    }

    return { energies: energies[i] as Int16Array[], exact: exact[i] as boolean, heldSame }
  })

  return { recordings, outsideSameBeats }
}

// one start: the settled column energies
export function recordRun(k: KnotStream, start: Reduced, settle: number, samples: number): Recording {
  return recordLockstep(k, [start], settle, samples).recordings[0] as Recording
}

// the fluctuations dE of every member: member m's energy minus the member mean, per beat and column
export function fluctuations(runs: readonly Recording[]): Float64Array[][] {
  const members = runs.length
  const beats = (runs[0] as Recording).energies.length
  const columns = ((runs[0] as Recording).energies[0] as Int16Array).length
  const out: Float64Array[][] = runs.map(() => [])

  for (let t = 0; t < beats; t++) {
    const mean = new Float64Array(columns)

    for (const run of runs) {
      const e = run.energies[t] as Int16Array

      for (let c = 0; c < columns; c++) mean[c] = (mean[c] as number) + (e[c] as number) / members
    }

    runs.forEach((run, m) => {
      const e = run.energies[t] as Int16Array
      const list = out[m] as Float64Array[]

      list.push(Float64Array.from(mean, (x, c) => (e[c] as number) - x))
    })
  }

  return out
}

// ---- the vacuum reading (E-GRV-0064): correlation against displacement, translation invariant ----

export type DisplacementClass = {
  readonly family: 'axis' | 'face' | 'body'
  readonly k: number
  readonly mesh: number
  readonly euclid: number
  // the images of the displacement under the husk's sign and axis symmetries
  readonly vectors: readonly (readonly [number, number, number])[]
}

// the three displacement families (k, 0, 0), (k, k, 0), (k, k, k) for k = 1 .. kMax, each with every sign and axis image
export function displacementClasses(kMax: number): DisplacementClass[] {
  const out: DisplacementClass[] = []
  const images = (base: readonly number[]): [number, number, number][] => {
    const seen = new Set<string>()
    const list: [number, number, number][] = []
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]

    for (const p of perms) {
      for (let signs = 0; signs < 8; signs++) {
        const v = [0, 1, 2].map(i => (base[p[i] as number] as number) * (signs & (1 << i) ? -1 : 1)) as [number, number, number]
        const key = v.join(',')

        if (!seen.has(key)) {
          seen.add(key)
          list.push(v)
        }
      }
    }

    return list
  }

  for (let k = 1; k <= kMax; k++) {
    for (const [family, base] of [['axis', [k, 0, 0]], ['face', [k, k, 0]], ['body', [k, k, k]]] as const) {
      out.push({ family, k, mesh: meshDistance(base), euclid: Math.hypot(...base), vectors: images(base) })
    }
  }

  return out
}

// per member, the sums behind every class correlation: for class j, index 3j + h holds sum dE(c) dE(c + v) over origins c
// in half h (h = 0: the origin's first husk coordinate below side / 2, h = 1: the rest; 2: both), images v and beats; the
// last index holds sum dE(c)^2 over every column and beat (the variance, the same for every displacement by translation)
export function classSums(box: ArrowBox, dE: readonly Float64Array[][], classes: readonly DisplacementClass[]): Float64Array[] {
  const side = box.side
  const columns = side ** 3
  const half = Uint8Array.from({ length: columns }, (_, c) => (columnPosition(c, side)[0] < side / 2 ? 0 : 1))
  const shift = classes.map(cl =>
    cl.vectors.map(v =>
      Int32Array.from({ length: columns }, (_, c) => {
        const p = columnPosition(c, side)
        const q = p.map((x, i) => (((x + (v[i] as number)) % side) + side) % side)

        return (q[0] as number) + side * (q[1] as number) + side * side * (q[2] as number)
      }),
    ),
  )

  return dE.map(member => {
    const sums = new Float64Array(classes.length * 3 + 1)

    for (const f of member) {
      let v = 0

      for (let c = 0; c < columns; c++) v += (f[c] as number) * (f[c] as number)

      sums[classes.length * 3] = (sums[classes.length * 3] as number) + v

      classes.forEach((cl, j) => {
        let lo = 0
        let hi = 0

        for (const table of shift[j] as Int32Array[]) {
          for (let c = 0; c < columns; c++) {
            const x = (f[c] as number) * (f[table[c] as number] as number)

            if (half[c] === 0) lo += x
            else hi += x
          }
        }

        sums[3 * j] = (sums[3 * j] as number) + lo
        sums[3 * j + 1] = (sums[3 * j + 1] as number) + hi
        sums[3 * j + 2] = (sums[3 * j + 2] as number) + lo + hi
      })
    }

    return sums
  })
}

// the class correlation from a total vector of classSums: half h of class j, normalized per origin and image by the
// per-column variance
export function classCorrelation(total: Float64Array, classes: readonly DisplacementClass[], j: number, h: 0 | 1 | 2, columns: number): number {
  const variance = (total[classes.length * 3] as number) / columns
  const images = (classes[j] as DisplacementClass).vectors.length
  const origins = h === 2 ? columns : columns / 2

  return (total[3 * j + h] as number) / (images * origins) / variance
}

// ---- the knot reading (E-GRV-0065): nearest-neighbor correlation per shell around the knot ----

export type ShellPairs = {
  readonly shells: readonly number[]
  // per shell, the axis-neighbor pairs (a, b) with both columns outside the knot and the pair's midpoint at that
  // rounded min-image distance from the knot's center
  readonly pairs: readonly Int32Array[]
}

export function shellPairs(k: KnotStream, shells: readonly number[]): ShellPairs {
  const side = k.box.side
  const lists: number[][] = shells.map(() => [])

  for (let a = 0; a < side ** 3; a++) {
    if (k.knotColumn[a]) continue

    const p = columnPosition(a, side)

    for (let axis = 0; axis < 3; axis++) {
      const q: [number, number, number] = [p[0], p[1], p[2]]

      q[axis] = ((q[axis] as number) + 1) % side

      const b = q[0] + side * q[1] + side * side * q[2]

      if (k.knotColumn[b]) continue

      const mid = p.map((x, i) => ring(x + (i === axis ? 0.5 : 0) - (k.center[i] as number), side))
      const r = Math.round(Math.hypot(...mid))
      const at = shells.indexOf(r)

      if (at >= 0) (lists[at] as number[]).push(a, b)
    }
  }

  return { shells, pairs: lists.map(l => Int32Array.from(l)) }
}

// per member, per shell s: index 3s the sum dE_a dE_b, 3s + 1 the sum dE_a^2, 3s + 2 the sum dE_b^2, over the shell's
// pairs and the beats
export function shellSums(dE: readonly Float64Array[][], sp: ShellPairs): Float64Array[] {
  return dE.map(member => {
    const sums = new Float64Array(sp.shells.length * 3)

    for (const f of member) {
      sp.pairs.forEach((pairs, s) => {
        let ab = 0
        let aa = 0
        let bb = 0

        for (let i = 0; i < pairs.length; i += 2) {
          const x = f[pairs[i] as number] as number
          const y = f[pairs[i + 1] as number] as number

          ab += x * y
          aa += x * x
          bb += y * y
        }

        sums[3 * s] = (sums[3 * s] as number) + ab
        sums[3 * s + 1] = (sums[3 * s + 1] as number) + aa
        sums[3 * s + 2] = (sums[3 * s + 2] as number) + bb
      })
    }

    return sums
  })
}

export function shellCorrelation(total: Float64Array, s: number): number {
  const aa = total[3 * s + 1] as number
  const bb = total[3 * s + 2] as number

  return aa > 0 && bb > 0 ? (total[3 * s] as number) / Math.sqrt(aa * bb) : 0
}
