// What the husk's symmetry allows a knit's transport, and so the lowest order in k at which its husk
// anisotropy can appear (E-RLT-0058).
//
// THE QUESTION. The CPT-isotropy fork is proven for the couple architecture (E-RLT-0048 to 0050) and the
// husk did not dissolve it at the wavelengths measured (E-RLT-0054). Light escapes it on the husk because
// W(F4) forces every rank-2 and rank-4 scalar invariant isotropic, so light's anisotropy is of relative
// order k^4 (E-MTH-0008). A knit's own anisotropy that also started at k^4 would vanish at long wavelength
// like a lattice artifact. This file derives, exactly, which transport tensors each relevant group forces
// isotropic on the husk, and so the order each knit's anisotropy may start at; E-RLT-0059 and E-RLT-0060
// measure it.
//
// THE TEST (code/measure/husk-transport-symmetry). A transport quantity's leading term has degree n0 = 2 in
// k: a diffusion coefficient D(k-hat) k^2 (a scalar function), a sound speed c(k-hat)^2 k^2 (scalar), a
// shear decay rate (degree 2 in the polarization a, which lies across k, and 2 in k: 'transverse'). The
// next terms carry k^4, k^6. For a group G, the restrictions to the husk (k4 = 0, a4 = 0) of every
// G-invariant polynomial of a kind and degree are computed as Reynolds averages of monomials at
// deterministic points; G FORCES that degree when every one is isotropic there. A quantity's relative
// anisotropy then starts at k^(n - 2), n the first degree G does not force.
//
// THE GROUPS: W(F4) (the 24-cell's 1,152 symmetries, light's group), the husk's own cubic group (the 48
// elements of W(F4) fixing the depth e4), Q8 (the cold quaternion knit's glide group, E-RLT-0054),
// {I, -I}, and each knit's own group measured here: the spatial parts of every forward glide and reversal
// of the committed and combined knits (code/measure/rule-symmetry-ledger over all of W(F4) and the six tone
// relabellings, with the four-line moves' firing states added), and of the cold weave (the same search on
// its dock collision with stores and demons, tone maps identity and charge conjugation).
//
// Gates, fixed before the first run:
//  G1 W(F4): scalar forced at degrees 2 and 4 and not at 6, husk and bulk (E-MTH-0008's law); transverse
//     forced at degree (2, 2), husk and bulk (an isotropic viscosity, E-RLT-0057's commutant 1)
//  G2 the husk cubic group: scalar forced at 2 and not at 4 on the husk; transverse not forced at (2, 2)
//  G3 Q8: scalar forced at 2 on the husk and in the bulk; transverse not forced at (2, 2) on the husk
//  G4 {I, -I}: scalar not forced at 2
//  G5 the committed and combined knits' measured groups are {I, -I} (order 2), as E-RLT-0045 and
//     E-RLT-0050 found
// Reported, not gated: W(F4)'s transverse degree (2, 4) (E-MTH-0008 counted an anisotropic quartic
// covariant, so it may not be forced), the cold weave's group, and the predicted order of each knit's
// husk anisotropy for diffusion, sound and shear.
// Verdict: pass if G1 to G5 hold, fail otherwise.
//
// DETERMINISM: exhaustive groups, Weyl-sequence sample points and golden-ratio dock states, no random
// numbers. Depth L1: exact invariant theory and exhaustive symmetry search.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { doubledClosure, doubledReflection, f4Roots } from '@/code/algebra/group/hurwitz-f4'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { denseCellStates, moveFiringStates, symmetryLedger, TONE_RELABELLINGS, CHARGE_CONJUGATION } from '@/code/measure/rule-symmetry-ledger'
import { doubledToMatrix, forcedIsotropic, matrixOfPermutation, type Matrix4 } from '@/code/measure/husk-transport-symmetry'
import { quaternionGroup } from '@/code/rule/quaternion-knit'
import { turningWeave } from '@/code/rule/collision'
import { combinedCollision, COMBINED_DEFAULT } from '@/code/rule/combined-knit'
import { scatterSchedule, HEAD_TURN_SPEC, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { coldDockCollide, makeColdWeave, type ColdWeave } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'

const ROOTS = rootsD4()
const GOLDEN = (Math.sqrt(5) - 1) / 2
const SCALAR_DEGREES = [2, 4, 6]
const TRANSVERSE_DEGREES = [2, 4]

type Row = { group: string; order: number; husk: Record<string, boolean>; bulk: Record<string, boolean>; residuals: Record<string, number>; counts: Record<string, number> }

function analyze(name: string, group: readonly Matrix4[]): Row {
  const husk: Record<string, boolean> = {}
  const bulk: Record<string, boolean> = {}
  const residuals: Record<string, number> = {}
  const counts: Record<string, number> = {}

  for (const [kind, degrees] of [
    ['scalar', SCALAR_DEGREES],
    ['transverse', TRANSVERSE_DEGREES],
  ] as const) {
    for (const degree of degrees) {
      for (const region of ['husk', 'bulk'] as const) {
        const r = forcedIsotropic({ group, kind, degree, husk: region === 'husk' })
        const key = `${kind}${degree}`

        ;(region === 'husk' ? husk : bulk)[key] = r.forced
        residuals[`${region}_${key}`] = r.residual
        counts[`${region}_${key}`] = r.invariants
      }
    }
  }

  return { group: name, order: group.length, husk, bulk, residuals, counts }
}

// the matrix group generated by the spatial parts of a ledger's entries
function spatialGroup(perms: readonly (readonly number[])[]): Matrix4[] {
  const seen = new Map<string, Matrix4>()
  const key = (m: Matrix4): string => m.map(x => Math.round(x * 2)).join(',')
  const mul = (a: Matrix4, b: Matrix4): Matrix4 =>
    Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].reduce((s, k) => s + (a[Math.floor(i / 4) * 4 + k] ?? 0) * (b[k * 4 + (i % 4)] ?? 0), 0))
  const gens = perms.map(matrixOfPermutation)
  const identity = Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? 1 : 0))
  let frontier: Matrix4[] = [identity]

  seen.set(key(identity), identity)

  while (frontier.length > 0) {
    const next: Matrix4[] = []

    for (const g of frontier) {
      for (const s of gens) {
        const h = mul(s, g)

        if (!seen.has(key(h))) {
          seen.set(key(h), h)
          next.push(h)
        }
      }
    }

    frontier = next
  }

  return [...seen.values()]
}

// the forward glides and reversals of the cold weave's dock collision with stores and demons, tone maps
// identity and charge conjugation, over every W(F4) coin map and every time shift or mirror phase
function coldWeaveSymmetries(weave: ColdWeave, perms: readonly (readonly number[])[]): { p: number[]; kind: 'forward' | 'reversal' }[] {
  const opposite = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
  const firsts = ROOTS.map((_, d) => d).filter(d => d < (opposite[d] ?? d))
  const lineOf = ROOTS.map((_, d) => firsts.indexOf(Math.min(d, opposite[d] ?? d)))
  const states = Array.from({ length: 160 }, (_, n) => {
    const vibe = Int8Array.from({ length: 24 }, (_, d) => {
      const u = ((n * 24 + d + 1) * GOLDEN) % 1

      return u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    })
    const store = Int32Array.from({ length: 24 }, (_, d) => (vibe[d] === 0 ? 0 : Math.floor((((n * 24 + d + 7) * GOLDEN * 1.37) % 1) * 3)))
    const demon = Int32Array.from({ length: 12 }, (_, l) => Math.floor((((n * 12 + l + 3) * GOLDEN * 2.3) % 1) * 4))

    return { vibe, store, demon }
  })
  const found: { p: number[]; kind: 'forward' | 'reversal' }[] = []
  const carry = (s: { vibe: Int8Array; store: Int32Array; demon: Int32Array }, p: readonly number[], sign: number) => {
    const vibe = new Int8Array(24)
    const store = new Int32Array(24)
    const demon = new Int32Array(12)

    for (let d = 0; d < 24; d++) {
      vibe[p[d] ?? 0] = sign * (s.vibe[d] ?? 0)
      store[p[d] ?? 0] = s.store[d] ?? 0
    }

    firsts.forEach((d, l) => {
      demon[lineOf[p[d] ?? 0] ?? 0] = s.demon[l] ?? 0
    })

    return { vibe, store, demon, role: undefined }
  }
  const same = (a: { vibe: Int8Array; store: Int32Array; demon: Int32Array }, b: { vibe: Int8Array; store: Int32Array; demon: Int32Array }): boolean =>
    a.vibe.every((x, i) => x === b.vibe[i]) && a.store.every((x, i) => x === b.store[i]) && a.demon.every((x, i) => x === b.demon[i])

  for (const p of perms) {
    for (const sign of [1, -1]) {
      for (const kind of ['forward', 'reversal'] as const) {
        for (let phase = 0; phase < 24; phase++) {
          let holds = true

          for (let n = 0; n < states.length && holds; n++) {
            for (let t = 0; t < 24 && holds; t++) {
              const s = states[n]!
              const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), demon: Int32Array.from(s.demon), role: undefined }

              coldDockCollide(weave, a, 0, t, true)

              const left = carry(a, p, sign)
              const right = carry(s, p, sign)

              if (kind === 'forward') {
                coldDockCollide(weave, right, 0, (t + phase) % 24, true)
              } else {
                coldDockCollide(weave, right, 0, (((phase - t) % 24) + 24) % 24, false)
              }

              holds = same(left, right)
            }
          }

          if (holds) found.push({ p: [...p], kind })
        }
      }
    }
  }

  return found
}

export default experiment({
  id: 'relativity/husk-transport-symmetry',
  code: 'E-RLT-0058',
  title:
    'what the husk symmetry allows a knit transport: W(F4) forces the husk scalar transport (diffusion, sound) isotropic through k^4, so its anisotropy is of relative order k^4, but forces the husk shear only at leading order, leaving it k^2; the husk cubic group forces the scalars at k^2 and the shear at no order, Q8 the rank-2 scalars only, and the committed knit, the combined knit and the cold weave keep only {I, -I} (glides and reversals, searched over W(F4)), which forces nothing, so their husk transport may be anisotropic at leading order',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const f4 = [...doubledClosure(f4Roots().map(doubledReflection)).values()]
    const f4Matrices = f4.map(doubledToMatrix)
    const cubic = f4.filter(g => g[3] === 0 && g[7] === 0 && g[11] === 0 && g[15] === 2).map(doubledToMatrix)
    const q8 = quaternionGroup().map(matrixOfPermutation)
    const identity = Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? 1 : 0))
    const pm = [identity, identity.map(x => -x)]

    // the knits' own groups
    const perms = weylF4DirectionPermutations({ directions: ROOTS })
    const opposite = meshOpposites(d4Mesh({ side: 3 }))
    const sets = scatterSchedule()
    const firing = moveFiringStates({ moves: sets.flat(), degree: 24 })
    const ledgerOf = (forward: (t: number) => (s: Int8Array, b: number, d: number) => void, inverse: (t: number) => (s: Int8Array, b: number, d: number) => void, extra: Int8Array[]) =>
      symmetryLedger({ forward, inverse, period: 24, permutations: perms, degree: 24, extraStates: extra, thoroughDense: 512 })
    const committedLedger = ledgerOf(turningWeave({ opposite }), turningWeave({ opposite, forward: false }), [])
    const combinedLedger = ledgerOf(
      combinedCollision({ spec: COMBINED_DEFAULT, opposite }),
      combinedCollision({ spec: COMBINED_DEFAULT, opposite, forward: false }),
      [...firing, ...denseCellStates({ count: 64, offset: 900, degree: 24 })],
    )
    // a reversal with coin part q is, on the lattice, the velocity reversal with the spatial map -q
    // (code/measure/rule-symmetry-ledger's header): its root permutation composed with the antipode
    const lattice = (p: readonly number[], kind: 'forward' | 'reversal'): number[] => (kind === 'reversal' ? p.map(d => opposite[d] ?? d) : [...p])
    const committedGroup = spatialGroup(committedLedger.map(e => lattice(perms[e.p]!, e.kind)))
    const combinedGroup = spatialGroup(combinedLedger.map(e => lattice(perms[e.p]!, e.kind)))
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const coldSpec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
    const coldWeave = makeColdWeave({ mesh: d4Mesh({ side: 3 }), spec: coldSpec })
    const coldEntries = coldWeaveSymmetries(coldWeave, perms)
    const coldGroup = spatialGroup(coldEntries.map(e => lattice(e.p, e.kind)))

    const rows = [
      analyze('wf4', f4Matrices),
      analyze('huskCubic', cubic),
      analyze('q8', q8),
      analyze('plusMinus', pm),
      analyze('committed', committedGroup),
      analyze('combined', combinedGroup),
      analyze('coldWeave', coldGroup),
    ]
    const row = (name: string): Row => rows.find(r => r.group === name)!
    const w = row('wf4')
    const c = row('huskCubic')
    const q = row('q8')
    const p = row('plusMinus')

    const g1 = w.order === 1152 && w.husk.scalar2! && w.husk.scalar4! && !w.husk.scalar6 && w.bulk.scalar2! && w.bulk.scalar4! && !w.bulk.scalar6 && w.husk.transverse2! && w.bulk.transverse2!
    const g2 = c.order === 48 && c.husk.scalar2! && !c.husk.scalar4 && !c.husk.transverse2
    const g3 = q.order === 8 && q.husk.scalar2! && q.bulk.scalar2! && !q.husk.transverse2
    const g4 = !p.husk.scalar2 && !p.bulk.scalar2
    const g5 = row('committed').order === 2 && row('combined').order === 2 && committedGroup.some(m => m[0] === -1 && m[5] === -1 && m[10] === -1 && m[15] === -1)

    // predicted order of the relative anisotropy on the husk: first unforced degree minus 2
    const order = (r: Row, kind: 'scalar' | 'transverse'): number => {
      const degrees = kind === 'scalar' ? SCALAR_DEGREES : TRANSVERSE_DEGREES
      const first = degrees.find(d => !r.husk[`${kind}${d}`])

      // forced through every degree tested: at least the last tested degree (the next one minus 2)
      return first === undefined ? (degrees[degrees.length - 1] ?? 0) : first - 2
    }

    const metrics: Record<string, number> = {}

    for (const r of rows) {
      metrics[`${r.group}Order`] = r.order

      for (const [k, v] of Object.entries(r.husk)) metrics[`${r.group}HuskForced_${k}`] = v ? 1 : 0
      for (const [k, v] of Object.entries(r.bulk)) metrics[`${r.group}BulkForced_${k}`] = v ? 1 : 0
      for (const [k, v] of Object.entries(r.counts)) metrics[`${r.group}Invariants_${k}`] = v

      metrics[`${r.group}PredictedHuskOrderScalar`] = order(r, 'scalar')
      metrics[`${r.group}PredictedHuskOrderShear`] = order(r, 'transverse')
    }

    metrics.committedLedgerEntries = committedLedger.length
    metrics.combinedLedgerEntries = combinedLedger.length
    metrics.combinedChargeConjugatedEntries = combinedLedger.filter(e => e.tau === CHARGE_CONJUGATION).length
    metrics.committedReversalEntries = committedLedger.filter(e => e.kind === 'reversal').length
    metrics.combinedReversalEntries = combinedLedger.filter(e => e.kind === 'reversal').length
    metrics.coldWeaveEntries = coldEntries.length
    metrics.coldWeaveReversalEntries = coldEntries.filter(e => e.kind === 'reversal').length
    metrics.toneRelabellingsSearched = TONE_RELABELLINGS.length
    metrics.seconds = (Date.now() - started) / 1000

    const pass = g1 && g2 && g3 && g4 && g5

    return verdict({
      status: pass ? 'pass' : 'fail',
      claim: `husk symmetry law for transport: W(F4) forces the husk scalar invariants isotropic at degrees 2 and 4 and not 6 (relative order k^4) and the husk shear invariants at (2, 2) ${w.husk.transverse4 ? 'and (2, 4)' : 'but not (2, 4) (relative order k^2)'}; the husk's cubic group forces only degree 2 (k^2, shear k^0); Q8 forces the rank-2 scalars (shear k^0); the committed and combined knits keep only {I, -I} (order ${row('committed').order} and ${row('combined').order}) and the cold weave a group of order ${row('coldWeave').order}, which force nothing, so their husk diffusion and shear may be anisotropic at leading order (k^0)`,
      metrics,
      control: {
        huskCubicScalar4Residual: c.residuals.husk_scalar4 ?? 0,
        wf4Scalar4Residual: w.residuals.husk_scalar4 ?? 0,
        wf4Scalar6Residual: w.residuals.husk_scalar6 ?? 0,
        plusMinusScalar2Residual: p.residuals.husk_scalar2 ?? 0,
      },
      notes: `L1. Gates G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5}. A group forcing a degree is a theorem about every knit with that symmetry; a group NOT forcing it only allows anisotropy, which the dynamics may or may not use (E-MTH-0008: the photon puts zero weight on W(F4)'s anisotropic quartic covariant). The knits' groups are the spatial parts of forward glides and reversals together (a reversal constrains a transport tensor through Onsager reciprocity as a glide does). The cold quaternion knit's group is Q8 by construction, checked in E-RLT-0054, and is not searched again here. DISCLOSED: the first run failed G5 (committed group order 1, cold weave order 1) because it took a reversal's coin part q as its spatial part; code/measure/rule-symmetry-ledger states a reversal with coin part q acts on the lattice as the velocity reversal with the spatial map -q, so the CPT reversal at the identity coin map is the point inversion -I. That reading was corrected and the file rerun; no gate moved, and every group-theory number (G1 to G4) was the same in both runs.`,
    })
  },
})
