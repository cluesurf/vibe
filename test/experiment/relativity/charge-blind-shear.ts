// Why is the coset-union vacuum's husk shear isotropic? (E-RLT-0096)
//
// THE PUZZLE (E-RLT-0094). The oriented coset-union store is kept by 72 elements of W(F4), which force the husk scalars
// and not the shear, and no orientation of the union is kept by a group that forces the shear; yet its exact periodic
// husk transport reads the shear isotropic at leading order (exponent 2.03), with the physical and staggered invariants
// uncoupled to 3e-12. A probe after that run found the linear medium commutes with exactly the same 72 point elements.
//
// THE ANGLE ASKED FOR (A). The union is four independent hub vacua, and a translation by L' / 2 D4 permutes them. An
// affine lift, a W(F4) element composed with such a translation (and with charge conjugation), moves the store but may
// still be a symmetry of the linear MEDIUM. Tested exhaustively: every affine element of the side-4 cell, 1,152 x 256 x
// 2 = 589,824, on the 8,192 right-coset representatives of the 72 (membership is constant on a coset, since the 72
// commute). Probe 1 (tmp/ks-probe1, before these gates, disclosed) found exactly the 72, no translation, no charge
// conjugation, and the store kept up to a sign per part by the same 72 with no flip. So A is predicted to FAIL.
//
// THE THEOREM INSTEAD (C, code/measure/charge-blind-transport, derived before probe 2). Split every pair of linear
// variables (a slot's love and fear, a line's store + and -) into its charge-conjugation-even sum and odd difference.
// (i) In the exact linearization the C-even outputs never depend on the C-odd inputs: B and K read occupation only, the
// pair move reads a sign only as "the two vibes are opposite", which a love and a fear meet with the same chance against
// a love-fear symmetric partner, and a store's sign decides only which slot of a made pair holds the love. (ii) The
// C-even block reads a store only through whether its line holds one: the stored law (2/3, 1/6, 1/6) and the reversed
// law (1/6, 2/3, 1/6) give the same 5/6. So the period map is block triangular and its C-even part, which holds energy,
// momentum, the shear, the sound, the depth mode and the twelve staggered invariants, is the medium of the UNORIENTED
// pattern. The unoriented coset union is kept by every W(F4) element about a hub and every translation of L': 73,728
// affine elements on the side-4 cell, whose linear parts are all of W(F4), which forces the husk shear at leading order.
// The 72 of the oriented store act on the C-odd part, the charge, which they force as a scalar. Corollary: each
// staggered invariant of dual line w carries the character e^(i pi w . t) of the L' translations, nontrivial for all 12
// lines, so no physical mode couples to a staggered one at any k (E-RLT-0094's 3e-12 is an exact zero).
//
// Gates, fixed before this file's first run (probe 2, tmp/ks-probe2, measured C1 and C2 on one frame row first,
// disclosed: 1.7e-16 and 6.1e-16, the control 0.148):
//  S0 the instrument: the full medium and its C-even quotient each commute with the 72 point elements about the hub
//     (defect below 1e-10), the reader's left residual below 1e-9
//  A  the user's angle: the affine elements commuting with the full medium force the husk shear. PREDICTED TO FAIL
//     (probe 1)
//  C1 closed: on every distinct dock matrix of the oriented union (both beats), and on all 16 sign patterns of one
//     frame row, the (C-even output, C-odd input) block is below 1e-13
//  C2 sign blind: the C-even block of the frame row is the same for its 16 sign patterns to 1e-13; control, emptying
//     one stored line changes it by more than 0.01
//  C3 the C-even group: the affine elements of the side-4 cell commuting with the C-even quotient (tested on the 4,096
//     right-coset representatives of the 72) have all 1,152 linear parts and exactly the 64 translations of L' mod
//     4 D4, and that group forces the husk scalars and the husk shear
//  C4 the consequence: the shear, sound and depth read by E-RLT-0086's reader at 3 husk directions and both rungs are
//     the same, to 1e-9 relative, for three orientations of the one unoriented union: the oriented union (72 kept),
//     the four translated orientations (24 kept) and the oriented union with one part's signs reversed
// Verdict: pass if S0, C1, C2, C3 and C4 hold (A reads as it reads, and is the answer to the angle); fail if S0 holds
// and any C fails; partial if S0 fails.
//
// FIRST RUN (606 s, tmp/ks-rlt96-run1.log): PASS, no gate moved. S0: the 72 commute with the full medium (1.1e-13) and
// its C-even quotient (1.5e-13). A false, as predicted: 1 passing representative (the identity coset, t = 0, c = +1),
// least failing defect 0.30. C1 4.4e-16, C2 6.1e-16 with the control 0.148 (= 4/27). C3: 1,024 of 4,096 representative
// pairs pass, 73,728 elements, 1,152 linear parts, exactly the 64 L' translations, least failing 0.26, forcing the
// scalars and the shear. C4: shear 3.4e-11, sound 1.8e-13, depth 2.8e-11. NOT PREDICTED: the charge (C-odd) also
// agrees across the three orientations (2.0e-11); the theorem does not claim it, and why is open. Title after the run.
//
// THE START FAMILY does not enter: the singlet linearization reads no link (a role point enters only as the chance
// `equal` that two points agree), so the medium is the same on every start. Stated, not run 17 times.
// DETERMINISM: exhaustive enumeration; the probe vectors are golden Weyl (code/tool/weyl); the reader's start block and
// directions are E-RLT-0086's. Depth L2. Husk first: every direction has k4 = 0.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { bounceLawMatrices, periodicMedium } from '@/code/measure/bounce-transport'
import { boxMaps, huskForcing } from '@/code/measure/varying-vacuum'
import { cellOps, leftInvariants, leftResidual, namedDockInvariants, readSymmetricTransport, rightInvariants, type SymmetricReading } from '@/code/measure/symmetry-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'
import { classKinds, classOf, coinsOnce, multiLineDockMatrices, orientedUnion, orientedUnionStore, splitByHubClass, unionHubStore } from '@/code/measure/dense-hub'
import { affineGroup, affineSymmetry, evenCommutationDefect, evenOddSplit, fullCommutationDefect } from '@/code/measure/charge-blind-transport'
import { weyl } from '@/code/tool/weyl'

const KC = 0.2793069366894861
const RUNGS = [KC / 4, KC / 16]
const TOLERANCE = 1e-9

export default experiment({
  id: 'relativity/charge-blind-shear',
  code: 'E-RLT-0096',
  title:
    "why the coset-union shear is isotropic, pass: not an affine lift (every affine element of the side-4 cell commuting with the linear medium, 589,824 tested on 8,192 coset representatives, is one of the store's own 72, with no translation and no charge conjugation) but charge blindness: the C-even part of the exact linearization is closed (4.4e-16) and blind to every store sign (6.1e-16, while emptying a line moves it 0.148), so energy, momentum, the shear, the sound, the depth mode and the staggered invariants run on the UNORIENTED union's medium, kept by 73,728 affine elements (all 1,152 of W(F4) with the 64 translations of L'), which force the husk shear; three orientations of the one union read the same shear, sound and depth to 3.4e-11",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const coins = coinsOnce()
    const box = boxMaps(coins, 4)
    const mesh = makeColorWeave({ side: 4, table: 'bind' }).mesh
    const hub = [0, 0, 0, 0]
    const oriented = orientedUnionStore(coins, 4, hub)
    const K = orientedUnion(coins).group
    const buildMedium = (store: Int8Array): { docks: ReturnType<typeof multiLineDockMatrices>; ops: ReturnType<typeof cellOps>; medium: ReturnType<typeof periodicMedium> } => {
      const docks = multiLineDockMatrices('lone', store, 256, coins)
      const medium = periodicMedium(mesh, docks.even, docks.odd)

      return { docks, medium, ops: cellOps(medium) }
    }
    const union = buildMedium(oriented)
    const probes = [0, 1].map(b => Float64Array.from({ length: 256 * 72 }, (_, i) => weyl(i + 1 + 7919 * b) - 0.5))

    log('medium')

    // ---- S0 ----
    let s0Full = 0
    let s0Even = 0

    for (const g of K) {
      const sym = affineSymmetry(coins, box, g, 0, 1)

      s0Full = Math.max(s0Full, fullCommutationDefect(union.ops, sym, probes))
      s0Even = Math.max(s0Even, evenCommutationDefect(union.ops, sym, probes))
    }

    const { vectors: left, consistent } = leftInvariants(union.medium, namedDockInvariants())
    const residual = leftResidual(union.ops, left)
    const s0 = s0Full < 1e-10 && s0Even < 1e-10 && residual < 1e-9 && consistent

    log('S0')

    // ---- A: the full medium's affine group ----
    const full = affineGroup({ coins, box, K, defect: g => fullCommutationDefect(union.ops, g, probes), charges: [1, -1], tolerance: TOLERANCE, log })
    const fullForcing = huskForcing(coins, full.linear)
    const a = fullForcing.husk2 && fullForcing.husk4 && fullForcing.huskShear2

    log('A')

    // ---- C1, C2 ----
    let c1Union = 0

    for (const m of [...union.docks.even, ...union.docks.odd]) c1Union = Math.max(c1Union, evenOddSplit(m).evenOutOddIn)

    let frame: number[] = []

    for (let x = 0; x < 256; x++) {
      const row = Array.from(oriented.subarray(x * 12, x * 12 + 12))

      if (row.filter(v => v !== 0).length === 4) {
        frame = row
        break
      }
    }

    const stored = frame.map((v, l) => (v !== 0 ? l : -1)).filter(l => l >= 0)
    const reference = bounceLawMatrices('lone', frame).map(m => evenOddSplit(m))
    let c1Signs = Math.max(...reference.map(r => r.evenOutOddIn))
    let c2 = 0

    for (let mask = 1; mask < 16; mask++) {
      const signs = frame.map((v, l) => {
        const k = stored.indexOf(l)

        return k >= 0 && (mask >> k) & 1 ? -v : v
      })
      const split = bounceLawMatrices('lone', signs).map(m => evenOddSplit(m))

      split.forEach((s, beat) => {
        c1Signs = Math.max(c1Signs, s.evenOutOddIn)

        const r = (reference[beat] as ReturnType<typeof evenOddSplit>).evenBlock

        for (let i = 0; i < r.length; i++) c2 = Math.max(c2, Math.abs((s.evenBlock[i] as number) - (r[i] as number)))
      })
    }

    const emptied = bounceLawMatrices('lone', frame.map((v, l) => (l === stored[0] ? 0 : v))).map(m => evenOddSplit(m))
    let control = 0

    emptied.forEach((s, beat) => {
      const r = (reference[beat] as ReturnType<typeof evenOddSplit>).evenBlock

      for (let i = 0; i < r.length; i++) control = Math.max(control, Math.abs((s.evenBlock[i] as number) - (r[i] as number)))
    })

    const c1 = c1Union < 1e-13 && c1Signs < 1e-13
    const c2ok = c2 < 1e-13 && control > 0.01

    log('C1 C2')

    // ---- C3: the C-even quotient's affine group ----
    const even = affineGroup({ coins, box, K, defect: g => evenCommutationDefect(union.ops, g, probes), charges: [1], tolerance: TOLERANCE, log })
    const kinds = classKinds()
    const lPrime = Array.from({ length: 256 }, (_, t) => t).filter(t => kinds[classOf(t, 4, hub)] !== 'root')
    const evenForcing = huskForcing(coins, even.linear)
    const sameTranslations = even.translations.length === lPrime.length && lPrime.every(t => even.translations.includes(t))
    const evenElements = even.passing.length * K.length
    const c3 = even.linear.length === coins.table.permutations.length && sameTranslations && evenForcing.husk2 && evenForcing.husk4 && evenForcing.huskShear2

    log('C3')

    // ---- C4: three orientations of one unoriented union ----
    const parts = splitByHubClass(oriented, 4, hub)
    const flipped = Int8Array.from(oriented, (v, i) => ((parts[1] as Int8Array)[i] !== 0 ? -v : v))
    const directions = huskDirections(3).slice(0, 3)
    const readOf = (m: { medium: ReturnType<typeof periodicMedium>; ops: ReturnType<typeof cellOps> }): SymmetricReading => {
      const l = leftInvariants(m.medium, namedDockInvariants()).vectors
      const r = rightInvariants(m.ops, l).vectors

      return readSymmetricTransport({ medium: m.medium, left: l, right: r, directions, rungs: RUNGS, log: what => log(what) })
    }
    const readings: { name: string; reading: SymmetricReading; rows: number }[] = [{ name: 'oriented union (72)', reading: readOf(union), rows: union.docks.distinct }]

    for (const [name, store] of [
      ['four translated orientations (24)', unionHubStore(coins, 4, hub)],
      ['oriented union, part 1 reversed', flipped],
    ] as const) {
      const m = buildMedium(store)

      readings.push({ name, reading: readOf(m), rows: m.docks.distinct })
    }

    const relative = (q: string): number => {
      const base = (readings[0] as { reading: SymmetricReading }).reading.values[q] ?? []
      let worst = 0

      for (const r of readings.slice(1)) {
        const vs = r.reading.values[q] ?? []

        vs.forEach((rung, i) =>
          rung.forEach((v, j) => {
            const b = (base[i] as number[])[j] as number

            worst = Math.max(worst, Math.abs(v - b) / Math.abs(b))
          }),
        )
      }

      return worst
    }
    const c4Shear = relative('shear')
    const c4Sound = relative('sound')
    const c4Depth = relative('depth')
    const c4Charge = relative('charge')
    const c4 = c4Shear < 1e-9 && c4Sound < 1e-9 && c4Depth < 1e-9

    log('C4')

    const status = s0 ? (c1 && c2ok && c3 && c4 ? 'pass' : 'fail') : 'partial'
    const cellsName = (ts: number[]): string => ts.map(t => (box.coords[t] as number[]).join('')).join(' ')

    return verdict({
      status,
      claim: `the affine elements of the side-4 cell commuting with the linear medium are ${full.passing.length === 1 ? 'one coset' : `${full.passing.length} coset-translation pairs`}: ${full.linear.length} linear parts, translations ${cellsName(full.translations)}, forcing the shear ${fullForcing.huskShear2}; the C-even part is closed (${Math.max(c1Union, c1Signs).toExponential(1)}) and blind to every store sign (${c2.toExponential(1)}; emptying a line moves it ${control.toFixed(3)}), so it is the unoriented union's medium, kept by ${evenElements} affine elements (${even.linear.length} linear parts, ${even.translations.length} translations) which force the husk shear; the shear, sound and depth of three orientations agree to ${Math.max(c4Shear, c4Sound, c4Depth).toExponential(1)} while the charge moves by ${c4Charge.toExponential(1)}`,
      metrics: {
        gateS0: s0 ? 1 : 0,
        gateA: a ? 1 : 0,
        gateC1: c1 ? 1 : 0,
        gateC2: c2ok ? 1 : 0,
        gateC3: c3 ? 1 : 0,
        gateC4: c4 ? 1 : 0,
        pointGroup: K.length,
        s0FullDefect: s0Full,
        s0EvenDefect: s0Even,
        leftResidual: residual,
        fullTested: full.tested,
        fullPassingReps: full.passing.length,
        fullLinear: full.linear.length,
        fullTranslations: full.translations.length,
        fullWorstPassing: full.worstPassing,
        fullLeastFailing: full.leastFailing,
        fullForcesShear: fullForcing.huskShear2 ? 1 : 0,
        c1Union,
        c1Signs,
        c2SignChange: c2,
        c2EmptyControl: control,
        evenTested: even.tested,
        evenPassingReps: even.passing.length,
        evenElements,
        evenLinear: even.linear.length,
        evenTranslations: even.translations.length,
        evenWorstPassing: even.worstPassing,
        evenLeastFailing: even.leastFailing,
        evenForcesScalars: evenForcing.husk2 && evenForcing.husk4 ? 1 : 0,
        evenForcesShear: evenForcing.huskShear2 ? 1 : 0,
        c4Shear,
        c4Sound,
        c4Depth,
        c4Charge,
        seconds: (Date.now() - started) / 1000,
      },
      control: Object.fromEntries(readings.flatMap((r, i) => [[`orientation${i}_rows`, r.rows], [`orientation${i}_shearMean`, r.reading.means['shear'] ?? NaN], [`orientation${i}_chargeMean`, r.reading.means['charge'] ?? NaN]])),
      notes: `L2. Gates: S0 ${s0} (72 defects full ${s0Full.toExponential(2)}, even ${s0Even.toExponential(2)}; left residual ${residual.toExponential(2)}), A ${a} (as predicted false), C1 ${c1}, C2 ${c2ok}, C3 ${c3}, C4 ${c4}. A: ${full.tested} tests on coset representatives, passing ${JSON.stringify(full.passing.map(p => [p.g, (box.coords[p.t] as number[]).join(''), p.c]))}, worst passing ${full.worstPassing.toExponential(2)}, least failing ${full.leastFailing.toExponential(2)}, forcing ${JSON.stringify(fullForcing)}. C3: ${even.tested} tests, ${even.passing.length} passing representative-translation pairs, linear parts ${even.linear.length}, translations ${even.translations.length} (L' mod 4 D4 has ${lPrime.length}, equal ${sameTranslations}), worst passing ${even.worstPassing.toExponential(2)}, least failing ${even.leastFailing.toExponential(2)}, forcing ${JSON.stringify(evenForcing)}. C4 (${directions.length} directions, rungs kc/4 and kc/16): ${readings.map(r => `${r.name}: ${r.rows} distinct rows, shear ${JSON.stringify(r.reading.values['shear'])}, charge ${JSON.stringify(r.reading.values['charge'])}`).join('; ')}. Largest relative differences: shear ${c4Shear.toExponential(2)}, sound ${c4Sound.toExponential(2)}, depth ${c4Depth.toExponential(2)}, charge ${c4Charge.toExponential(2)}. The start family does not enter (the singlet linearization reads no link). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
