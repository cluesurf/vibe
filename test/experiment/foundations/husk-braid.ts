// THE DOUBLE-EXCHANGE PHASE OF TWO HOLES ON R*, READ AS A WILSON LOOP OF THE EXACT RELATIVE TRANSFER (E-FND-0176, item
// 0023 of moving-matter, decision 005; OPEN-MAT-07 first half, OPEN-FND-03). Two holes of the register sea on
// E-FND-0161's exact two-hole engine at total momentum 0, L = 8, the 3d slice w = 0 of the relative dock y. For each
// slice link y -> y + e the one-cycle hop block B(y, e) is read exactly; its unitary polar part U(y, e) is the
// connection, and a loop's holonomy is the ordered product of U along it (code/measure/husk-braid).
//
// GATES (fixed 2026-10-08 in the item, before any run of this read):
//   PASS     (1) every fcc triangle with all docks at string length >= 2 from contact has eigenphases 0 to 1e-9;
//            (2) on all three shapes (ring 12, octagon 16, saddle 16) the centred loop (encircling contact in its
//            plane, the double exchange) against the same loop displaced off contact has eigenphases 0 to 1e-9 mod 2 pi;
//            (3) the half loop y -> -y closed by the sector identification reads pi to 1e-9; (4) exchange kept.
//   KILL     a centred-minus-displaced phase above 1e-3, the same on every eigenvalue and across the three shapes to
//            1e-6, and not 0 mod 2 pi: a topological statistical phase, an anyon.
//   PARTIAL  a nonzero difference that changes with shape (named: what near contact makes it), or a half loop not pi.
//   CONTROL  a typed flux tube theta = pi / 4 along the slice z axis through contact (Peierls phases on the links
//            crossing one half-plane) must read pi / 2 on every centred shape and 0 on every displaced one.
//   FREE     the free rule must give the same PASS read (flatness is not the pair piece's doing).
//   GAP      not tested: anyons as quasiparticles of a many-body state.
//
// TWO READINGS FIXED BY THE INSTRUMENT, NOT BY THE RESULT (log.md, 0023 deviation). (a) The fiber is the sector pairs
// (16), not the engine's 64: the four complement states of each member are a Gram-Schmidt choice at each momentum
// separately, so the 64 x 64 block changes when they are re-chosen (a momentum-dependent change of basis is not a gauge
// transform in y), while the sector-pair block does not (read below, `frame`). (b) Every free sector link is a scalar
// times a fixed unitary (`freeLinkOff`), so a loop of the free rule returns a pure scalar e^(i sum alpha), the hops' own
// dynamical phase, which no flat connection can remove under the forward convention; the triangle and half-loop reads
// divide out the free loop's scalar (the same step sequence), which leaves the free rule exactly flat. The centred-minus-
// displaced read needs no such step: the two loops take the same steps.
//
// FIRST RUN (tmp/braid-gate.log, 1,119 s, 256 slice docks, 11,088 oriented triangles at length >= 2): PARTIAL, no
// anyon. Instrument clean (exchange 7.9e-16, sector ranks 0.0242..0.0252, frame-free sector block 7.6e-17, the tube
// pi/2 linked and 0 unlinked exactly, the free rule flat to 5.4e-15). Centred-minus-displaced on R*: ring 1.67, octagon
// -2.30, saddle 1.68 (circular means; spreads 0.24 to 0.32 over the 16 eigenphases): shape-dependent, not one phase,
// so the kill does not fire. The string phase curves the whole slice (triangles up to 3.09); with it removed the slice
// is flat at length >= 3 (5.6e-15), the octagon reads 0 (7.2e-15) and its half loop pi exactly, and the ring and
// saddle read 1.1e-2 to 1.3e-2: curvature near contact from the contact phase.
//
// DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  braidRead,
  braidSetup,
  circularMean,
  circularSpread,
  connectionOf,
  differencePhases,
  DISPLACE,
  dockKey,
  eigenphases,
  holonomy,
  hopBlocks,
  landauPhase,
  linkDetPhases,
  maxAbs,
  maxDiff,
  pathAdmissible,
  PATHS,
  phasedBlocks,
  planeChern,
  planeField,
  polar,
  reciprocalLinks,
  reciprocity,
  referencedPhase,
  scale,
  SECTOR_PAIRS,
  sectorHopBlocks,
  sectorSliceBlocks,
  SLICE_ROOTS,
  rootKey,
  sliceDocks,
  slicePlanes,
  sub,
  swapLeft16,
  torusLength,
  transport,
  triangles,
  wrap,
  type BraidRead,
  type CM,
  type Connection,
  type PlaneChern,
  type ReciprocalLinks,
} from '@/code/measure/husk-braid'

const L = 8
const THETA = Math.PI / 4
const TOL = 1e-9
const KILL_FLOOR = 1e-3
const KILL_AGREE = 1e-6

const flag = (b: boolean): number => (b ? 1 : 0)
const fmt = (x: number): string => x.toExponential(3)
const list = (xs: readonly number[]): string => xs.map(x => x.toFixed(6)).join(' ')

export default experiment({
  id: 'foundations/husk-braid',
  code: 'E-FND-0176',
  title:
    'the double-exchange phase of two register holes on R*, read as a Wilson loop of the exact one-cycle relative transfer on the 3d husk slice (L = 8), partial with no anyon: a loop round contact differs from the same loop displaced by a phase that changes with shape and across eigenvalues (no single statistical phase), from two fields, the pair string curving the whole slice and the contact phase curving only next to contact; a typed flux tube reads pi/2 linked and 0 unlinked, the free rule is flat',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return huskBraidRun()
  },
})

export type HuskBraidRun = {
  verdict: Verdict
  read: BraidRead
  // the diagnostic: the same read with the pair piece's string removed (the contact phase alone)
  contact: BraidRead
  frame: { sector: number; full: number; fullSvLeast: number }
}

export function huskBraidRun(
  log: (s: string) => void = () => {},
): Verdict {
  return huskBraidDetail(log).verdict
}

export function huskBraidDetail(log: (s: string) => void = () => {}): HuskBraidRun {
  const started = Date.now()
  const opts = { backend: 'native' as const, threads: 12 }
  const b = braidSetup(L, opts)

  log('frame built')

  const cache: { free?: Map<string, CM[]> } = {}
  const r = braidRead(b, THETA, log, b.rule, cache)

  log('rule read')

  const rc = braidRead(b, THETA, log, b.contact, cache)

  log('contact-only read')

  // the frame check: the same blocks with every complement re-chosen; the full block's least singular value there
  const g = braidSetup(L, opts, true)
  const y = [2, 2, 0, 0]
  const B0 = hopBlocks(b, b.rule, y)
  const B1 = hopBlocks(g, g.rule, y)
  const frame = {
    sector: Math.max(...B0.map((B, k) => maxDiff(sub(B, SECTOR_PAIRS), sub(B1[k]!, SECTOR_PAIRS)))),
    full: Math.max(...B0.map((B, k) => maxDiff(B, B1[k]!))),
    fullSvLeast: Math.min(...B0.map(B => polar(B).sv[0]!)),
  }

  log('frame check read')

  // instrument
  const I1 = r.exchange.rule <= TOL && r.exchange.free <= TOL
  const I2 = r.sectorSv.rule[0] > 1e-6 * r.sectorSv.rule[1] && r.sectorSv.free[0] > 1e-6 * r.sectorSv.free[1]
  const I3 = r.freeTranslation <= 1e-12 && r.freeLinkOff <= 1e-12
  const I4 = frame.sector <= 1e-12
  const I5 = r.shapes.every(
    s =>
      s.encircling.roots &&
      s.encircling.winding === 1 &&
      s.encircling.least >= 2 &&
      s.displaced.roots &&
      s.displaced.winding === 0 &&
      s.displaced.least >= 2,
  )
  const controlOk = r.shapes.every(
    s =>
      maxAbs(s.controlLinked.map(x => wrap(x - 2 * THETA))) <= TOL &&
      maxAbs(s.controlDisplaced) <= TOL,
  )
  const instrument = I1 && I2 && I3 && I4 && I5 && controlOk

  // the reads
  const plaq = r.plaquettes.find(p => p.least === 2)!
  const P1 = plaq.ruleReferenced <= TOL
  const diffs = r.shapes.map(s => maxAbs(s.rule))
  const P2 = diffs.every(d => d <= TOL)
  // the half loop: the referenced -X_f T_half has eigenphases 0 or pi only, pi on the fiber-symmetric pairs (10)
  const halfOff = r.shapes.map(s => Math.max(...s.halfRuleReferenced.map(x => Math.min(Math.abs(x), Math.PI - Math.abs(x)))))
  const halfPi = r.shapes.map(s => s.halfRuleReferenced.filter(x => Math.PI - Math.abs(x) <= TOL).length)
  const P3 = halfOff.every(d => d <= TOL) && halfPi.every(n => n === 10)
  const pass = P1 && P2 && P3 && I1
  const freeFlat =
    r.plaquettes.find(p => p.least === 2)!.freeReferenced <= TOL &&
    r.shapes.every(s => maxAbs(s.free) <= TOL)
  // the kill: a uniform, shape-independent, nonzero difference
  const means = r.shapes.map(s => circularMean(s.rule))
  const spreads = r.shapes.map(s => circularSpread(s.rule))
  const kill =
    means.every(m => Math.abs(m) > KILL_FLOOR) &&
    spreads.every(s => s <= KILL_AGREE) &&
    Math.max(...means.map(m => Math.abs(wrap(m - means[0]!)))) <= KILL_AGREE
  const controlFailsPass = r.shapes.every(s => maxAbs(s.control) > 1e-3)
  const status: Verdict['status'] = !instrument ? 'fail' : kill ? 'fail' : pass ? 'pass' : 'partial'
  // the diagnostic: the same reads with the string removed
  const cPlaq = rc.plaquettes.find(p => p.least === 2)!
  const cDiffs = rc.shapes.map(s => maxAbs(s.rule))
  const cHalf = rc.shapes.map(s => maxAbs(s.halfRelative))
  const stringIsCause = cPlaq.ruleReferenced <= TOL && cDiffs.every(d => d <= TOL) && cHalf.every(d => d <= TOL)
  const shapeLine = (x: BraidRead): string =>
    x.shapes
      .map(
        s =>
          `${s.shape}: centred-minus-displaced max ${fmt(maxAbs(s.rule))} mean ${circularMean(s.rule).toFixed(6)} spread ${circularSpread(s.rule).toFixed(6)} [${list(s.rule)}]; free ${fmt(maxAbs(s.free))}; control linked ${list(s.controlLinked.slice(0, 1))} displaced ${fmt(maxAbs(s.controlDisplaced))}; centred-minus-displaced with the tube max ${fmt(maxAbs(s.control))}; half loop -X T_half referenced [${list(s.halfRuleReferenced)}], rule over free [${list(s.halfRelative)}]; least length displaced ${s.displaced.least}`,
      )
      .join('; ')
  const plaqLine = (x: BraidRead): string =>
    x.plaquettes
      .map(
        p =>
          `least ${p.least}: ${p.count} oriented triangles, rule ${fmt(p.rule)} referenced ${fmt(p.ruleReferenced)}, free ${fmt(p.free)} referenced ${fmt(p.freeReferenced)} (free off scalar ${fmt(p.freeOff)}), referenced rule by least length ${p.byLength.map((v, i) => (i >= p.least ? `${i}:${fmt(v)}` : '')).filter(Boolean).join(' ')}`,
      )
      .join('; ')
  const cFar = rc.plaquettes.find(p => p.least === 3)!.ruleReferenced
  const cSpreads = rc.shapes.map(s => circularSpread(s.rule))
  const cause = stringIsCause
    ? `the pair piece's string phase (s min(V, 8) on the sector pairs, reversed on the partner pairs at beat 2): with the string removed and the contact phase kept the connection is flat off contact (triangles ${fmt(cPlaq.ruleReferenced)}), every centred loop reads its displaced one (${cDiffs.map(fmt).join(', ')}) and the half loop adds nothing (${cHalf.map(fmt).join(', ')}); the string's phase grows with V, so it is a field across the whole slice, not curvature near contact`
    : `two fields, neither a statistical phase. (i) The pair piece's string phase (s min(V, 8), growing with the string length) curves the whole slice: with it removed and the contact phase kept, every triangle wholly at string length >= 3 is flat (${fmt(cFar)}). (ii) The contact phase leaves curvature next to contact only: triangles touching length 2 reach ${fmt(cPlaq.ruleReferenced)}, and the centred-minus-displaced phases are ${rc.shapes.map((s, k) => `${s.shape} ${fmt(cDiffs[k]!)} (spread ${fmt(cSpreads[k]!)}, half loop ${fmt(cHalf[k]!)})`).join(', ')}: shape-dependent and not uniform over the eigenphases, so curvature near contact, not statistics`

  const claim = !instrument
    ? `instrument failed: exchange ${I1} ranks ${I2} free scalar ${I3} frame-free sector ${I4} paths ${I5} control ${controlOk}`
    : kill
      ? `KILL: a uniform, shape-independent centred-minus-displaced phase ${means[0]!.toFixed(6)} on all three shapes, a statistical phase that is not fermionic`
      : pass
        ? `no anyons: the sector connection is flat off contact (triangles ${fmt(plaq.ruleReferenced)}), the centred loops read the displaced ones on all three shapes (${diffs.map(fmt).join(', ')}), the half loop reads pi on the 10 fiber-symmetric pairs, exchange kept; the tube control reads pi/2 linked and 0 unlinked`
        : `partial, no anyon: the centred-minus-displaced phases change with shape and are not one phase (means ${means.map(x => x.toFixed(4)).join(', ')}, spreads over the 16 eigenphases ${spreads.map(x => x.toFixed(4)).join(', ')}), so no statistical phase exists to kill on; the rule's sector connection is not flat on the 3d husk slice (triangles at string length >= 2 up to ${fmt(plaq.ruleReferenced)} after the free hop phase is divided out, free ${fmt(plaq.freeReferenced)}) and the half loop is not pi (off {0, pi} by up to ${fmt(Math.max(...halfOff))}). The cause: ${cause}. The typed tube reads pi/2 linked and 0 unlinked to ${fmt(TOL)}, the free rule is flat (${freeFlat})`

  return {
    verdict: verdict({
      status,
      claim,
      metrics: {
        instrument: flag(instrument),
        exchangeRule: r.exchange.rule,
        exchangeFree: r.exchange.free,
        sectorSvRuleLeast: r.sectorSv.rule[0],
        sectorSvRuleLargest: r.sectorSv.rule[1],
        sectorSvFree: r.sectorSv.free[0],
        fullSvLeast: frame.fullSvLeast,
        freeTranslation: r.freeTranslation,
        freeLinkOff: r.freeLinkOff,
        frameSector: frame.sector,
        frameFull: frame.full,
        control: flag(controlOk),
        controlFailsPass: flag(controlFailsPass),
        plaquetteRule: plaq.rule,
        plaquetteRuleReferenced: plaq.ruleReferenced,
        plaquetteFreeReferenced: plaq.freeReferenced,
        plaquettes: plaq.count,
        ringDiff: diffs[0]!,
        octagonDiff: diffs[1]!,
        saddleDiff: diffs[2]!,
        halfOff: Math.max(...halfOff),
        freeFlat: flag(freeFlat),
        pass: flag(pass),
        kill: flag(kill),
        stringIsCause: flag(stringIsCause),
        contactPlaquette: cPlaq.ruleReferenced,
        contactPlaquetteFar: cFar,
        contactDiff: Math.max(...cDiffs),
        contactHalf: Math.max(...cHalf),
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L1: exact one-cycle hop blocks of E-FND-0161's two-hole engine (R* with L(s), fiber 8, total momentum 0), L = 8, slice w = 0 (${r.docks} docks), sector fiber 16 (the 64 block is frame-dependent: re-chosen complements change it by ${fmt(frame.full)}, the sector block by ${fmt(frame.sector)}). Ranks: sector singular values rule ${fmt(r.sectorSv.rule[0])}..${fmt(r.sectorSv.rule[1])}, free ${fmt(r.sectorSv.free[0])}..${fmt(r.sectorSv.free[1])}; full least ${fmt(frame.fullSvLeast)} (at 2,2,0,0). Exchange B(-y,-e) = X B(y,e) X to ${fmt(r.exchange.rule)} (rule), ${fmt(r.exchange.free)} (free). RULE plaquettes: ${plaqLine(r)}. RULE shapes (displaced by 4,4,0,0): ${shapeLine(r)}. STRING REMOVED plaquettes: ${plaqLine(rc)}. STRING REMOVED shapes: ${shapeLine(rc)}. Gap, not tested: anyons as quasiparticles of a many-body state.`,
    }),
    read: r,
    contact: rc,
    frame,
  }
}

// ---- part 'chern' (item 0045, OPEN-MAT-07 first half) ----
//
// Does the pair string's field on the relative coordinate carry net flux? C of the U(1) (determinant) part of the
// sector-pair connection over each closed lattice plane of the w = 0 slice, the free hop's det-phase divided out.
// GATES (fixed in the item 2026-10-08, before any run of this read):
//   ADMISSIBLE  every plaquette's principal det-phase at most pi - 0.1 in magnitude, else the plane is unread (OPEN at
//               L 8, the count reported, the margin never moved).
//   PASS        every read plane C = 0 to 1e-9: no net flux, 0023's partial is a smooth string interaction.
//   FLUX        a read plane with C a nonzero integer: flux attachment, a Decide: item with the plane table.
//   INSTRUMENT  a read plane with C off an integer beyond 1e-9: instrument failure.
//   CONTROLS    the free rule C = 0 (by construction once its own phase is divided out, so the raw free read is also
//               reported); the string-removed diagnostic C = 0; a typed uniform field of one flux quantum through each
//               plane reads C = 1.
// PLANES. A coordinate plane of the fcc slice holds a square mesh with no in-plane triangle (its in-plane roots never sum
// to a root), so its plaquettes are squares; the {111} planes hold the triangles. Both are read.
//
// FIRST RUN (tmp/braid-chern.log, 174 s): INSTRUMENT FAILURE by the fixed table, cause understood. Controls clean (the
// typed quantum reads C = 1 to 2e-15 on all 40 planes), but every read rule plane (34 of 40) has C off an integer
// (2.49 to 15.70): the forward one-cycle hop is not reciprocal, phi(y, e) + phi(y + e, -e) differs from the free one by
// up to 3.07, and that dynamical part does not cancel round a closed plane. The antisymmetrized (reciprocal) det field
// is flat, C = 0 on every plane (tmp/braid-recip.log). Which field to read is escalated (moving-matter log, 0045).

const MARGIN = 0.1

type StepPhase = (a: readonly number[], e: readonly number[]) => number

export type BlockStore = {
  get(name: string): Map<string, CM[]> | undefined
  set(name: string, blocks: Map<string, CM[]>): void
}

export type HuskChernRun = {
  verdict: Verdict
  rule: PlaneChern[]
  contact: PlaneChern[]
  free: PlaneChern[]
  freeRaw: PlaneChern[]
  typedFree: PlaneChern[]
  typedRule: PlaneChern[]
}

export function huskChernDetail(log: (s: string) => void = () => {}, store?: BlockStore): HuskChernRun {
  const started = Date.now()
  const opts = { backend: 'native' as const, threads: 12 }
  const b = braidSetup(L, opts)
  const docks = sliceDocks(b.t)

  log('frame built')

  const blocksOf = (name: string, rule: typeof b.rule): Map<string, CM[]> => {
    const hit = store?.get(name)

    if (hit) {
      log(`${name} sector blocks from the store`)
      return hit
    }

    const m = sectorSliceBlocks(b, rule, docks, s => log(`${name} ${s}`))

    store?.set(name, m)

    return m
  }

  // the sector-only blocks against the full block's sector part at one dock
  const y = [2, 2, 0, 0]
  const full = hopBlocks(b, b.rule, y)
  const part = sectorHopBlocks(b, b.rule, y)
  const sectorOnly = Math.max(...full.map((B, k) => maxDiff(sub(B, SECTOR_PAIRS), part[k]!)))

  log(`sector-only blocks against the full block ${sectorOnly.toExponential(3)}`)

  const phases = (name: string, rule: typeof b.rule): Map<string, Float64Array> =>
    linkDetPhases(connectionOf(L, blocksOf(name, rule)))
  const ruleP = phases('rule', b.rule)
  const freeP = phases('free', b.free)
  const contactP = phases('contact', b.contact)

  log('det-phases read')

  // exchange: B(-y, -e) = X B(y, e) X keeps det
  let exchange = 0

  for (const P of [ruleP, contactP]) {
    for (const d of docks) {
      SLICE_ROOTS.forEach((e, k) => {
        const a = P.get(dockKey(L, d))![k]!
        const n = P.get(dockKey(L, d.map(x => -x)))![rootKey(e.map(x => -x))]!

        exchange = Math.max(exchange, Math.abs(wrap(a - n)))
      })
    }
  }

  // the free det-phase is one number per root (translation invariant)
  let freeTranslation = 0
  const f0 = freeP.get(dockKey(L, docks[0]!))!

  for (const P of freeP.values()) {
    P.forEach((v, k) => (freeTranslation = Math.max(freeTranslation, Math.abs(wrap(v - f0[k]!)))))
  }

  const planes = slicePlanes(L)
  const ruleRef = referencedPhase(L, ruleP, freeP)
  const contactRef = referencedPhase(L, contactP, freeP)
  const freeRef = referencedPhase(L, freeP, freeP)
  const freeRaw = referencedPhase(L, freeP, null)
  const read = (phase: StepPhase): PlaneChern[] => planes.map(p => planeChern(L, p, phase, MARGIN))
  const typed = (base: StepPhase): PlaneChern[] =>
    planes.map(p => {
      const f = planeField(p)

      return planeChern(L, p, (a, e) => base(a, e) + landauPhase(L, f.k, f.sign, a, e), MARGIN)
    })
  const rule = read(ruleRef)
  const contact = read(contactRef)
  const free = read(freeRef)
  const freeRawRead = read(freeRaw)
  const typedFree = typed(freeRef)
  const typedRule = typed(ruleRef)

  // the typed field alone: every plaquette of a plane carries 2 pi / (its plaquette count), exactly
  let typedUniform = 0

  for (const p of planes) {
    const f = planeField(p)
    const want = (2 * Math.PI) / p.loops.length

    for (const loop of p.loops) {
      let ph = 0

      for (let m = 0; m < loop.length; m++) {
        const a = loop[m]!
        const c = loop[(m + 1) % loop.length]!

        ph += landauPhase(L, f.k, f.sign, a, c.map((x, i) => x - a[i]!))
      }

      typedUniform = Math.max(typedUniform, Math.abs(wrap(ph - want)))
    }
  }

  log('planes read')

  const isRead = (x: PlaneChern): boolean => x.inadmissible === 0
  const counts = planes.every(p => p.loops.length === (p.kind === 'square' ? (L * L) / 2 : 2 * L * L))
  const closed = rule.every(x => x.closed)
  const typedOk = typedUniform <= 1e-12 && typedFree.every(x => Math.abs(x.C - 1) <= TOL)
  const freeOk = free.every(x => isRead(x) && Math.abs(x.C) <= TOL)
  const contactRead = contact.filter(isRead)
  const contactOk = contactRead.every(x => Math.abs(x.C) <= TOL)
  const instrument =
    sectorOnly <= 1e-14 && exchange <= TOL && freeTranslation <= 1e-12 && counts && closed && typedOk && freeOk
  const readPlanes = rule.filter(isRead)
  const nonInteger = readPlanes.filter(x => x.offInteger > TOL)
  const flux = readPlanes.filter(x => x.offInteger <= TOL && Math.abs(x.C) > TOL)
  const status: Verdict['status'] = !instrument
    ? 'fail'
    : nonInteger.length > 0
      ? 'fail'
      : flux.length > 0
        ? 'open'
        : readPlanes.length === 0
          ? 'open'
          : contactOk
            ? 'pass'
            : 'fail'
  const row = (x: PlaneChern): string =>
    `${x.name}${x.contact ? '*' : ''} n${x.plaquettes} C ${x.C.toFixed(9)} off ${fmt(x.offInteger)} links ${x.linkSum.toFixed(6)} largest ${x.largest.toFixed(4)} bad ${x.inadmissible}`
  const table = (xs: PlaneChern[]): string => xs.map(row).join('; ')
  const unread = rule.length - readPlanes.length
  const claim = !instrument
    ? `instrument failed: sector-only ${fmt(sectorOnly)} exchange ${fmt(exchange)} free translation ${fmt(freeTranslation)} counts ${counts} closed ${closed} typed ${typedOk} (uniform ${fmt(typedUniform)}) free ${freeOk}`
    : nonInteger.length > 0
      ? `instrument failure: ${nonInteger.length} read planes have C off an integer by up to ${fmt(Math.max(...nonInteger.map(x => x.offInteger)))} (${nonInteger.map(x => `${x.name} C ${x.C.toFixed(6)}`).join(', ')}); the forward-convention det-phases do not cancel link against reverse link (links sum ${nonInteger.map(x => x.linkSum.toFixed(6)).join(', ')} quanta)`
      : flux.length > 0
        ? `flux attachment: ${flux.length} read planes carry net flux (${flux.map(x => `${x.name} C ${Math.round(x.C)}`).join(', ')}); the string field is not a smooth interaction`
        : readPlanes.length === 0
          ? `open at L 8: no plane is admissible (every plane has a plaquette with det-phase above pi - ${MARGIN})`
          : contactOk
            ? `no net flux: every read plane (${readPlanes.length} of ${rule.length}, ${unread} unread) has C = 0 to ${fmt(Math.max(...readPlanes.map(x => Math.abs(x.C))))}, so 0023's shape-dependent phase is a smooth string interaction, not statistics, and the string attaches no flux; the typed one-quantum field reads C = 1 on every plane, the string-removed read C = 0 on its ${contactRead.length} read planes`
            : `control failed: the string-removed read has C nonzero on a read plane`

  return {
    verdict: verdict({
      status,
      claim,
      metrics: {
        instrument: flag(instrument),
        sectorOnly,
        exchange,
        freeTranslation,
        typedUniform,
        typed: flag(typedOk),
        planes: rule.length,
        readPlanes: readPlanes.length,
        unreadPlanes: unread,
        readContactPlanes: readPlanes.filter(x => x.contact).length,
        largestReadC: readPlanes.length ? Math.max(...readPlanes.map(x => Math.abs(x.C))) : 0,
        nonInteger: nonInteger.length,
        flux: flux.length,
        contactRead: contactRead.length,
        contactOk: flag(contactOk),
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L1: det-phase of the sector-pair connection (E-FND-0176's links, L = 8, slice w = 0, ${docks.length} docks), the free hop's det-phase divided out, margin pi - ${MARGIN}. Planes: 24 coordinate (squares, 32 each) and 16 {111} (triangles, 128 each); * holds contact. RULE: ${table(rule)}. STRING REMOVED: ${table(contact)}. FREE raw (own phase not divided out): ${table(freeRawRead)}. TYPED on free: ${table(typedFree)}. TYPED on rule: ${table(typedRule)}.`,
    }),
    rule,
    contact,
    free,
    freeRaw: freeRawRead,
    typedFree,
    typedRule,
  }
}

// ---- part 'flux' (item 0045 rewritten by decision 010, OPEN-MAT-07 first half) ----
//
// The same stored sector blocks, read on the reciprocal connection V = U_f (X^dag)^(1/2) of decision 010 (rule, free,
// string removed). READ 1: C of det V per closed plane. READ 2: 0023's loop table on V.
// GATES (fixed in the item 2026-10-08, before any V loop read):
//   INSTRUMENT  |V(y + e, -e) V(y, e) - 1| <= 1e-12 on every admissible link; a link whose X has an eigenphase within 0.1
//               of pi is inadmissible and every plane and loop through it is unread (counted, the margin never moved).
//   READ 1      every read plane's C an integer to 1e-9 (else instrument failure); all 0: no net flux; any nonzero: flux
//               attachment, a Decide: with the plane table.
//   READ 2      PASS every centred-minus-displaced eigenphase <= 1e-2 on all three shapes: 0023's partial is
//               non-reciprocity and E-FND-0176 is clean on V. KILL (0023's, unchanged) above 1e-3, the same across
//               shapes and eigenvalues to 1e-6, not 0 mod 2 pi: an anyon, a Decide:. Otherwise CURVATURE, named by the
//               traceless spread and the string lengths of the largest V plaquettes. Half loop pi on the 10 fiber-
//               symmetric pairs and 0 on the 6 antisymmetric to 1e-2, else reported.
//   CONTROLS    free V plaquettes 0 to 1e-12 and C 0; a typed one-quantum field on free V reads C = 1 to 1e-9 on every
//               plane; the tube theta = pi/4 reads pi/2 linked and 0 displaced to 1e-9 (on the rule's V); a typed
//               dynamical phase, free blocks times e^(-i (g(y) + g(y + e))), g = 0.35 cos(pi y_x/4) (amended by 0047
//               after a run: the first g, cos cos cos, is even under the displacement, so its forward read was 0 by
//               construction), must give the forward centred-minus-displaced |phase| 1.4 sum cos(pi v_x/4) mod 2 pi
//               (0.4766 ring, 2.8000 octagon, 0.4766 saddle) to 1e-9 and a V read 0 to 1e-9 on every loop and plane,
//               else the run stops as instrument failure.

const PASS_LOOP = 1e-2
const G_AMP = 0.35

export type LoopRow = {
  shape: string
  read: boolean
  // eigenphases of W(centred) W(displaced)^dag on the connection
  diff: number[]
  mean: number
  spread: number
  max: number
  // the half loop -X_f T_half: its eigenphases, and how many sit at pi and at 0 to 1e-2
  half: number[]
  halfPi: number
  halfZero: number
}

export type FluxRead = {
  planes: PlaneChern[]
  // planes holding an inadmissible link (unread)
  planeBad: number[]
  loops: LoopRow[]
  // the largest |eigenphase| of an fcc triangle's V holonomy by its least string length (index), over read triangles
  plaquetteByLength: number[]
  plaquetteMax: number
  // the largest read triangles: their phase and least string length
  plaquetteTop: { phase: number; length: number; at: string }[]
  trianglesRead: number
  trianglesUnread: number
  linksInadmissible: number
  reciprocity: number
  xMax: number
}

export type HuskFluxRun = {
  verdict: Verdict
  rule: FluxRead
  contact: FluxRead
  free: FluxRead
  typed: PlaneChern[]
  dynamical: { forward: LoopRow[]; V: FluxRead }
}

function loopRows(rl: ReciprocalLinks, c: Connection): LoopRow[] {
  return Object.entries(PATHS).map(([shape, path]) => {
    const moved = path.map(p => p.map((x, i) => x + DISPLACE[i]!))
    const half = path.slice(0, path.length / 2 + 1)
    const read = pathAdmissible(rl, path) && pathAdmissible(rl, moved) && pathAdmissible(rl, half, false)
    const diff = differencePhases(holonomy(c, path), holonomy(c, moved))
    const hl = eigenphases(scale(swapLeft16(transport(c, half)), -1, 0))

    return {
      shape,
      read,
      diff,
      mean: circularMean(diff),
      spread: circularSpread(diff),
      max: maxAbs(diff),
      half: hl,
      halfPi: hl.filter(x => Math.PI - Math.abs(x) <= PASS_LOOP).length,
      halfZero: hl.filter(x => Math.abs(x) <= PASS_LOOP).length,
    }
  })
}

function fluxRead(L: number, rl: ReciprocalLinks, docks: readonly (readonly number[])[]): FluxRead {
  const det = linkDetPhases(rl.V)
  const planes = slicePlanes(L)
  const phase = referencedPhase(L, det, null)
  const rows = planes.map(p => planeChern(L, p, phase, MARGIN))
  const planeBad = planes.map(p => p.loops.filter(l => !pathAdmissible(rl, l)).length)
  const byLength: number[] = []
  const top: { phase: number; length: number; at: string }[] = []
  let read = 0
  let unread = 0

  for (const tri of triangles(docks)) {
    if (!pathAdmissible(rl, tri)) {
      unread++
      continue
    }

    read++

    const len = Math.min(...tri.map(p => torusLength(L, p)))
    const ph = maxAbs(eigenphases(holonomy(rl.V, tri)))

    byLength[len] = Math.max(byLength[len] ?? 0, ph)
    top.push({ phase: ph, length: len, at: tri.map(p => dockKey(L, p)).join(' ') })
    top.sort((a, b) => b.phase - a.phase)
    top.length = Math.min(top.length, 8)
  }

  let bad = 0
  let xMax = 0

  for (const [k, ok] of rl.admissible) {
    bad += ok.filter(x => !x).length
    rl.xPhases.get(k)!.forEach(ps => (xMax = Math.max(xMax, maxAbs(ps))))
  }

  return {
    planes: rows,
    planeBad,
    loops: loopRows(rl, rl.V),
    plaquetteByLength: Array.from(byLength, x => x ?? 0),
    plaquetteMax: Math.max(0, ...top.map(t => t.phase)),
    plaquetteTop: top,
    trianglesRead: read,
    trianglesUnread: unread,
    linksInadmissible: bad,
    reciprocity: reciprocity(rl),
    xMax,
  }
}

export function huskFluxDetail(log: (s: string) => void = () => {}, store?: BlockStore): HuskFluxRun {
  const started = Date.now()
  let setup: ReturnType<typeof braidSetup> | undefined
  const blocksOf = (name: 'rule' | 'free' | 'contact'): Map<string, CM[]> => {
    const hit = store?.get(name)

    if (hit) {
      log(`${name} sector blocks from the store`)
      return hit
    }

    setup ??= braidSetup(L, { backend: 'native', threads: 12 })

    const m = sectorSliceBlocks(setup, setup[name], sliceDocks(setup.t), s => log(`${name} ${s}`))

    store?.set(name, m)

    return m
  }
  const ruleB = blocksOf('rule')
  const freeB = blocksOf('free')
  const contactB = blocksOf('contact')
  const docks = [...ruleB.keys()].map(k => k.split(',').map(Number))
  const rec = (B: Map<string, CM[]>): ReciprocalLinks => reciprocalLinks(L, B, freeB, MARGIN)
  const ruleRl = rec(ruleB)
  const rule = fluxRead(L, ruleRl, docks)

  log('rule V read')

  const contact = fluxRead(L, rec(contactB), docks)
  const freeRl = rec(freeB)
  const free = fluxRead(L, freeRl, docks)

  log('string-removed and free V read')

  // the typed one-quantum field through each plane, on fiber 0 of the free blocks (det V carries it once)
  const planes = slicePlanes(L)
  const typedByField = new Map<string, Map<string, Float64Array>>()
  const typed = planes.map(p => {
    const f = planeField(p)
    const key = `${f.k},${f.sign}`

    if (!typedByField.has(key)) {
      const tb = phasedBlocks(freeB, (y, e) => landauPhase(L, f.k, f.sign, y, e), true)

      typedByField.set(key, linkDetPhases(rec(tb).V))
    }

    return planeChern(L, p, referencedPhase(L, typedByField.get(key)!, null), MARGIN)
  })

  // the tube on the rule's V: linked 2 theta, displaced 0
  const tube = Object.values(PATHS).map(path => {
    const moved = path.map(p => p.map((x, i) => x + DISPLACE[i]!))

    return {
      linked: differencePhases(holonomy(ruleRl.V, path, THETA), holonomy(ruleRl.V, path)),
      displaced: differencePhases(holonomy(ruleRl.V, moved, THETA), holonomy(ruleRl.V, moved)),
    }
  })

  // the typed dynamical phase (amended by 0047): g1 = 0.35 cos(pi y_x / 4), odd under the displacement (4, 4, 0, 0),
  // so the forward centred-minus-displaced phase is 4 sum g1 = 1.4 sum cos(pi v_x / 4) over the shape's docks
  const g1 = (y: readonly number[]): number => G_AMP * Math.cos((Math.PI * y[0]!) / 4)
  const dynRl = rec(phasedBlocks(freeB, (y, e) => -(g1(y) + g1(y.map((x, i) => x + e[i]!))), false))
  const dynamical = { forward: loopRows(dynRl, dynRl.forward), V: fluxRead(L, dynRl, docks) }
  const dynWant = Object.values(PATHS).map(p => Math.abs(wrap(4 * p.reduce((s, v) => s + g1(v), 0))))
  // the diagnostic only: the first control, g = 0.35 cos cos cos, even under the displacement, so 0 by construction
  const g0 = (y: readonly number[]): number =>
    G_AMP * Math.cos((Math.PI * y[0]!) / 4) * Math.cos((Math.PI * y[1]!) / 4) * Math.cos((Math.PI * y[2]!) / 4)
  const dyn0Rl = rec(phasedBlocks(freeB, (y, e) => -(g0(y) + g0(y.map((x, i) => x + e[i]!))), false))
  const dyn0 = { forward: loopRows(dyn0Rl, dyn0Rl.forward), V: loopRows(dyn0Rl, dyn0Rl.V) }

  log('controls read')

  // instrument
  const RECIP = 1e-12
  const recipOk = [rule, contact, free, dynamical.V].every(x => x.reciprocity <= RECIP)
  const freeOk =
    free.plaquetteMax <= 1e-12 &&
    free.planes.every(x => Math.abs(x.C) <= TOL) &&
    free.linksInadmissible === 0 &&
    freeRl.freeOff <= 1e-12
  const typedOk = typed.every(x => Math.abs(x.C - 1) <= TOL)
  const tubeOk = tube.every(
    t => maxAbs(t.linked.map(x => wrap(x - 2 * THETA))) <= TOL && maxAbs(t.displaced) <= TOL,
  )
  // every forward eigenphase's magnitude against the shape's expected |phase|
  const dynForward = Math.max(
    ...dynamical.forward.map((r, s) => maxAbs(r.diff.map(x => Math.abs(x) - dynWant[s]!))),
  )
  const dynV = Math.max(
    dynamical.V.plaquetteMax,
    ...dynamical.V.loops.map(r => r.max),
    ...dynamical.V.planes.map(x => Math.abs(x.C)),
    ...dynamical.V.planes.map(x => x.largest),
  )
  const dynOk = dynWant.every(w => w > PASS_LOOP) && dynForward <= TOL && dynV <= TOL
  const closed = rule.planes.every(x => x.closed)
  const instrument = recipOk && freeOk && typedOk && tubeOk && dynOk && closed
  // read 1
  const readPlanes = rule.planes.filter((_, i) => rule.planeBad[i] === 0)
  const nonInteger = readPlanes.filter(x => x.offInteger > TOL)
  const flux = readPlanes.filter(x => x.offInteger <= TOL && Math.abs(x.C) > TOL)
  const contactPlanes = contact.planes.filter((_, i) => contact.planeBad[i] === 0)
  // read 2
  const loops = rule.loops.filter(r => r.read)
  const loopPass = loops.length === 3 && loops.every(r => r.max <= PASS_LOOP)
  const kill =
    loops.length === 3 &&
    loops.every(r => Math.abs(r.mean) > KILL_FLOOR && r.spread <= KILL_AGREE) &&
    Math.max(...loops.map(r => Math.abs(wrap(r.mean - loops[0]!.mean)))) <= KILL_AGREE
  const halfOk = loops.every(r => r.halfPi === 10 && r.halfZero === 6)
  const status: Verdict['status'] = !instrument
    ? 'fail'
    : nonInteger.length > 0
      ? 'fail'
      : flux.length > 0
        ? 'open'
        : kill
          ? 'fail'
          : loops.length < 3
            ? 'open'
            : loopPass
              ? 'pass'
              : 'partial'
  const loopLine = (x: LoopRow[]): string =>
    x
      .map(
        r =>
          `${r.shape}${r.read ? '' : ' UNREAD'}: max ${fmt(r.max)} mean ${r.mean.toFixed(6)} spread ${r.spread.toFixed(6)} [${list(r.diff)}]; half loop pi ${r.halfPi} zero ${r.halfZero} [${list(r.half)}]`,
      )
      .join('; ')
  const planeLine = (x: FluxRead): string =>
    x.planes
      .map(
        (p, i) =>
          `${p.name}${p.contact ? '*' : ''} C ${p.C.toFixed(12)} largest ${p.largest.toExponential(2)}${x.planeBad[i] ? ` UNREAD (${x.planeBad[i]} plaquettes on inadmissible links)` : ''}`,
      )
      .join('; ')
  const plaqLine = (x: FluxRead): string =>
    `read ${x.trianglesRead}, unread ${x.trianglesUnread}, max ${fmt(x.plaquetteMax)}, by least length ${x.plaquetteByLength.map((v, i) => `${i}:${fmt(v)}`).join(' ')}; largest ${x.plaquetteTop
      .slice(0, 4)
      .map(t => `${t.phase.toFixed(4)} at length ${t.length} (${t.at})`)
      .join(', ')}`
  const failures = [
    !recipOk &&
      `reciprocity ${[rule, contact, free, dynamical.V].map(x => fmt(x.reciprocity)).join(', ')} (rule, string removed, free, dynamical)`,
    !freeOk &&
      `free V plaquettes ${fmt(free.plaquetteMax)} C max ${fmt(Math.max(...free.planes.map(x => Math.abs(x.C))))} scalar off ${fmt(freeRl.freeOff)}`,
    !typedOk && `typed quantum C ${typed.map(x => x.C.toFixed(9)).join(' ')}`,
    !tubeOk && 'tube',
    !dynOk &&
      `typed dynamical control: forward centred-minus-displaced off the expected ${dynWant.map(w => w.toFixed(6)).join(', ')} by ${fmt(dynForward)} (must be <= ${TOL}), V ${fmt(dynV)} (must be <= ${TOL})`,
    !closed && 'a plane is not closed',
  ].filter(Boolean)
  const largestC = readPlanes.length ? Math.max(...readPlanes.map(x => Math.abs(x.C))) : 0
  const claim = !instrument
    ? `instrument failure, no verdict: ${failures.join('; ')}`
    : nonInteger.length > 0
      ? `instrument failure: ${nonInteger.length} read planes have C of det V off an integer`
      : flux.length > 0
        ? `flux attachment: ${flux.map(x => `${x.name} C ${Math.round(x.C)}`).join(', ')}`
        : kill
          ? `KILL: a uniform shape-independent phase ${loops[0]!.mean.toFixed(6)} on V, an anyon`
          : loops.length < 3
            ? `open: ${3 - loops.length} shapes run on inadmissible links`
            : loopPass
              ? `no net flux and no curvature: det V has C = 0 on every read plane (${readPlanes.length} of ${rule.planes.length}, largest ${fmt(largestC)}), and every centred-minus-displaced V eigenphase is at most ${fmt(Math.max(...loops.map(r => r.max)))}, so 0023's shape-dependent phase is non-reciprocity (the endpoints' dynamical phase), not curvature, and E-FND-0176 is clean on V`
              : `no net flux, curvature: det V has C = 0 on every read plane (${readPlanes.length} of ${rule.planes.length}), but the V loops differ from their displaced ones by up to ${fmt(Math.max(...loops.map(r => r.max)))} (traceless spreads ${loops.map(r => r.spread.toFixed(4)).join(', ')}), the largest V plaquettes at string length ${rule.plaquetteTop.map(t => t.length).join(', ')}`

  return {
    verdict: verdict({
      status,
      claim,
      metrics: {
        instrument: flag(instrument),
        reciprocityRule: rule.reciprocity,
        reciprocityContact: contact.reciprocity,
        reciprocityFree: free.reciprocity,
        reciprocityDynamical: dynamical.V.reciprocity,
        linksInadmissibleRule: rule.linksInadmissible,
        linksInadmissibleContact: contact.linksInadmissible,
        xMaxRule: rule.xMax,
        planes: rule.planes.length,
        readPlanes: readPlanes.length,
        readContactPlanes: contactPlanes.length,
        largestReadC: largestC,
        nonInteger: nonInteger.length,
        flux: flux.length,
        loopsRead: loops.length,
        ringMax: rule.loops[0]!.max,
        octagonMax: rule.loops[1]!.max,
        saddleMax: rule.loops[2]!.max,
        loopPass: flag(loopPass),
        kill: flag(kill),
        halfOk: flag(halfOk),
        plaquetteMaxRule: rule.plaquetteMax,
        plaquetteMaxContact: contact.plaquetteMax,
        freePlaquette: free.plaquetteMax,
        typed: flag(typedOk),
        tube: flag(tubeOk),
        dynamicalForward: dynForward,
        dynamicalV: dynV,
        dynamical: flag(dynOk),
        seconds: (Date.now() - started) / 1000,
      },
      notes: `L1: E-FND-0176's stored sector blocks (L = 8, slice w = 0, ${docks.length} docks) on V = U_f (X^dag)^(1/2), free scalar divided out, margin pi - ${MARGIN}. RULE planes: ${planeLine(rule)}. RULE loops (displaced by 4,4,0,0): ${loopLine(rule.loops)}. RULE triangles: ${plaqLine(rule)}. STRING REMOVED planes: ${planeLine(contact)}. STRING REMOVED loops: ${loopLine(contact.loops)}. STRING REMOVED triangles: ${plaqLine(contact)}. FREE: triangles ${plaqLine(free)}; C ${free.planes.map(x => x.C.toExponential(1)).join(' ')}. TYPED quantum C: ${typed.map(x => `${x.name} ${x.C.toFixed(12)}`).join(' ')}. TUBE linked ${tube.map(t => list(t.linked.slice(0, 1))).join(' ')}, displaced ${tube.map(t => fmt(maxAbs(t.displaced))).join(' ')}. DYNAMICAL g1 = 0.35 cos(pi y_x / 4), expected |phase| ${dynWant.map(w => w.toFixed(9)).join(', ')}: forward ${loopLine(dynamical.forward)}; V loops ${loopLine(dynamical.V.loops)}; V triangles ${fmt(dynamical.V.plaquetteMax)}, V plane C largest ${fmt(Math.max(...dynamical.V.planes.map(x => Math.abs(x.C))))}. DIAGNOSTIC (the first control, g = 0.35 cos cos cos, even under the displacement, 0 by construction, not a gate): forward ${loopLine(dyn0.forward)}; V ${loopLine(dyn0.V)}.`,
    }),
    rule,
    contact,
    free,
    typed,
    dynamical,
  }
}
