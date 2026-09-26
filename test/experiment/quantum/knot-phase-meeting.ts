// A non-Clifford covariant meeting: the knot phase U(theta) = 1 + (e^(i theta) - 1) P_knot on three loves
// (E-QTM-0139). P_knot = (1/9) sum_v D(v)^(x3) is the seventh dimension of the LLL commutant (E-QTM-0134), so
// U(theta) commutes with every frame change on three loves for every theta. Does it measure, and what does it
// do to mana?
//
// Structure (derived before the probe): P_knot is the average of the diagonal displacements, so its Wigner
// kernel, and U(theta)'s, only moves joint points by diagonal shifts (x1 + u, x2 + u, x3 + u). Every pairwise
// difference x_i - x_j is kept, so a record can only learn the system's label relative to itself: with the
// apparatus on lines, a shift moves the system's label and the record's by the same [d, u].
//
// DISCLOSED: this file was written after tmp/qtm139-probe.ts ran (0.4 s kernels, 12 angles). The probe
// printed 0 off-diagonal-shift entries, 0 exact measurements, the best mutual information 0.918 log 3, and
// the mana of the output of every line-product input at 12 angles. The gates below are those readings, so
// this experiment confirms a probe; it is not a blind test. Status is set to partial for that reason when
// every gate holds.
//
// Gates:
//   G1 the kernel of U(theta) at every one of 12 angles moves points only by diagonal shifts (0 entries off)
//   G2 no exact measurement: over the 12 angles minus theta = 0, every system slot, every pair of apparatus
//      lines, every class and every (system after, record) slot pair, 0 cases where the system's class
//      label is kept exactly on all 3 line inputs and a record label is a bijection of it
//   G3 mana: from stabilizer inputs (every line product) the output mana is 0 at theta = 0 and above 0 at
//      every other angle, and U(theta) and U(-theta) make the same mana
//
// FIRST RUN (2026-09-26, 1.8 s): partial, every gate as the probe read. 0 off-diagonal entries; 0 exact
// measurements in 114,048 apparatus cases, best mutual information 0.918 log 3; mana 0 at theta = 0, rising
// to 0.9479 at theta = pi, symmetric in theta.
//
// Depth L2: exact operator algebra in double precision. Role-grid numbers only; the husk is not read.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { displacementOperators } from '@/code/measure/qutrit-clifford'
import { operator, phasePointOperators, tensorOperators, multiplyOperators, type Operator } from '@/code/measure/grid-weights'
import { LABEL, LINES } from '@/code/measure/in-model-apparatus'

const STEPS = 12

export default experiment({
  id: 'quantum/knot-phase-meeting',
  code: 'E-QTM-0139',
  title:
    'the knot phase, a non-Clifford meeting that commutes with every frame change on three loves, moves joint points only by diagonal shifts, keeps every pairwise difference, measures nothing exactly with apparatus on lines, and makes mana from stabilizer inputs at every angle but 0',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const points = phasePointOperators(3)
    const knot = operator(27)

    for (const d of displacementOperators(1)) {
      const t = tensorOperators(tensorOperators(d, d), d)

      for (let i = 0; i < 729; i++) {
        knot.re[i] = (knot.re[i] ?? 0) + (t.re[i] ?? 0) / 9
        knot.im[i] = (knot.im[i] ?? 0) + (t.im[i] ?? 0) / 9
      }
    }

    const sparse = points.map(a => {
      const out: [number, number, number, number][] = []

      for (let i = 0; i < 27; i++) {
        for (let j = 0; j < 27; j++) {
          const re = a.re[i * 27 + j] ?? 0
          const im = a.im[i * 27 + j] ?? 0

          if (Math.abs(re) > 1e-12 || Math.abs(im) > 1e-12) {
            out.push([i, j, re, im])
          }
        }
      }

      return out
    })
    const transform = (m: Operator): [Float64Array, Float64Array] => {
      const re = new Float64Array(729)
      const im = new Float64Array(729)

      sparse.forEach((s, x) => {
        let r = 0
        let q = 0

        for (const [i, j, ar, ai] of s) {
          const mr = m.re[j * 27 + i] ?? 0
          const mi = m.im[j * 27 + i] ?? 0

          r += ar * mr - ai * mi
          q += ar * mi + ai * mr
        }

        re[x] = r / 27
        im[x] = q / 27
      })

      return [re, im]
    }

    // U A_y U^dagger = A_y + z P A_y + conj(z) A_y P + |z|^2 P A_y P, z = e^(i theta) - 1
    const k10re = new Float64Array(729 * 729)
    const k10im = new Float64Array(729 * 729)
    const k11 = new Float64Array(729 * 729)

    for (let y = 0; y < 729; y++) {
      const pa = multiplyOperators(knot, points[y]!)
      const [r1, i1] = transform(pa)
      const [r2] = transform(multiplyOperators(pa, knot))

      for (let x = 0; x < 729; x++) {
        k10re[x * 729 + y] = r1[x]!
        k10im[x * 729 + y] = i1[x]!
        k11[x * 729 + y] = r2[x]!
      }
    }

    const minus = (a: number, b: number): number => 3 * ((Math.floor(a / 3) - Math.floor(b / 3) + 3) % 3) + (((a % 3) - (b % 3) + 3) % 3)
    let offDiagonal = 0

    for (let x = 0; x < 729; x++) {
      for (let y = 0; y < 729; y++) {
        if (Math.abs(k10re[x * 729 + y]!) + Math.abs(k10im[x * 729 + y]!) + Math.abs(k11[x * 729 + y]!) > 1e-12) {
          const d = [minus(Math.floor(x / 81), Math.floor(y / 81)), minus(Math.floor(x / 9) % 9, Math.floor(y / 9) % 9), minus(x % 9, y % 9)]

          offDiagonal += d[0] === d[1] && d[1] === d[2] ? 0 : 1
        }
      }
    }

    const kernelAt = (theta: number): Float64Array => {
      const zr = Math.cos(theta) - 1
      const zi = Math.sin(theta)
      const z2 = zr * zr + zi * zi
      const k = new Float64Array(729 * 729)

      for (let i = 0; i < 729 * 729; i++) {
        k[i] = 2 * (zr * k10re[i]! - zi * k10im[i]!) + z2 * k11[i]!
      }

      for (let x = 0; x < 729; x++) {
        k[x * 729 + x] = k[x * 729 + x]! + 1
      }

      return k
    }

    let exactMeasurements = 0
    let cases = 0
    let bestInfo = 0
    const manaAt: number[] = []
    const coord = (x: number, slot: number): number => (slot === 0 ? Math.floor(x / 81) : slot === 1 ? Math.floor(x / 9) % 9 : x % 9)

    for (let step = 0; step < STEPS; step++) {
      const k = kernelAt((2 * Math.PI * step) / STEPS)
      let manaMax = 0
      const outs: Float64Array[] = []

      for (let a = 0; a < 12; a++) {
        for (let b = 0; b < 12; b++) {
          for (let c = 0; c < 12; c++) {
            const out = new Float64Array(729)

            for (const pa of LINES[a]!.points) {
              for (const pb of LINES[b]!.points) {
                for (const pc of LINES[c]!.points) {
                  const y = 81 * pa + 9 * pb + pc

                  for (let x = 0; x < 729; x++) {
                    out[x] = out[x]! + k[x * 729 + y]! / 27
                  }
                }
              }
            }

            let abs = 0

            for (let x = 0; x < 729; x++) {
              abs += Math.abs(out[x]!)
            }

            manaMax = Math.max(manaMax, Math.log(abs))
            outs.push(out)
          }
        }
      }

      manaAt.push(manaMax)

      if (step === 0) {
        continue
      }

      for (let s = 0; s < 3; s++) {
        const [i, j] = [0, 1, 2].filter(q => q !== s)

        for (let li = 0; li < 12; li++) {
          for (let lj = 0; lj < 12; lj++) {
            for (let cl = 0; cl < 4; cl++) {
              const classLines = LINES.map((l, idx) => (l.c === cl ? idx : -1)).filter(idx => idx >= 0)

              for (let t = 0; t < 3; t++) {
                for (let r = 0; r < 3; r++) {
                  if (r === t) {
                    continue
                  }

                  const joint = new Float64Array(9)
                  let kept = true

                  for (const ls of classLines) {
                    const lines = [0, 0, 0]

                    lines[s] = ls
                    lines[i!] = li
                    lines[j!] = lj

                    const out = outs[144 * lines[0]! + 12 * lines[1]! + lines[2]!]!
                    const sysLabels = [0, 0, 0]
                    const lam = LABEL[9 * cl + (LINES[ls]!.points[0] ?? 0)] ?? 0

                    for (let x = 0; x < 729; x++) {
                      const w = out[x]!

                      if (Math.abs(w) < 1e-13) {
                        continue
                      }

                      const ks = LABEL[9 * cl + coord(x, t)] ?? 0
                      const kr = 3 * lam + (LABEL[9 * cl + coord(x, r)] ?? 0)

                      sysLabels[ks] = (sysLabels[ks] ?? 0) + w
                      joint[kr] = (joint[kr] ?? 0) + w
                    }

                    kept = kept && Math.abs(sysLabels[lam]! - 1) < 1e-9
                  }

                  let info = 0

                  for (let a = 0; a < 3; a++) {
                    for (let b = 0; b < 3; b++) {
                      const col = [0, 1, 2].reduce((sum, a2) => sum + joint[3 * a2 + b]! / 3, 0)
                      const p = joint[3 * a + b]! / 3

                      if (p > 1e-12 && col > 1e-12) {
                        info += p * Math.log(p / (col / 3))
                      }
                    }
                  }

                  bestInfo = Math.max(bestInfo, info)
                  cases++

                  const copy = [0, 1, 2].every(a => [0, 1, 2].filter(b => Math.abs(joint[3 * a + b]!) > 1e-9).length === 1)

                  exactMeasurements += kept && copy ? 1 : 0
                }
              }
            }
          }
        }
      }
    }

    const symmetricBad = manaAt.filter((m, step) => step > 0 && Math.abs(m - (manaAt[STEPS - step] ?? 0)) > 1e-9).length
    const gates = {
      G1: offDiagonal === 0,
      G2: exactMeasurements === 0 && cases > 0,
      G3: Math.abs(manaAt[0] ?? 1) < 1e-9 && manaAt.every((m, step) => step === 0 || m > 1e-6) && symmetricBad === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'partial' : 'fail',
      claim: `the knot phase moves joint points only by diagonal shifts (${offDiagonal} entries off), so it keeps every pairwise difference and measures nothing exactly: 0 of ${cases.toLocaleString()} apparatus cases copy a class label with the label kept (best mutual information ${(bestInfo / Math.log(3)).toFixed(4)} log 3); from stabilizer inputs it makes mana at every angle but 0, largest ${Math.max(...manaAt).toFixed(4)} at theta = pi`,
      metrics: {
        offDiagonal,
        cases,
        exactMeasurements,
        bestInfoOverLog3: bestInfo / Math.log(3),
        symmetricBad,
        ...Object.fromEntries(manaAt.map((m, step) => [`manaMax_step${step}_of_${STEPS}`, m])),
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, double precision on exact operators, no random numbers: all 1,728 line-product inputs and 12 angles enumerated. Gates written after the probe that read the same numbers (disclosed in the header), so partial at best. A three-love knot phase acts on a knot, which E-QTM-0135 found can never be the measured triple.',
    })
  },
})
