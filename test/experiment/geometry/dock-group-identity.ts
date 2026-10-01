// WHICH GROUP IS THE DOCK'S? (E-GMT-0039, for the dock's symmetry and its isotropy). The package says "the dock's 1,152
// turns and mirrors" (E-FRC-0259) and builds that group from the four simple reflections of a textbook F4
// (code/measure/spinor-register f4Group), and E-FRC-0258 found that the 192 elements keeping the three frames apart
// have three quartic invariants. Neither file asks which groups these are from the dock alone. This file builds the
// group from the dock's own 24 slot roots (code/measure/dock-mixer DOCK_ROOTS) with no diagram, and identifies it and
// the frame-keeping subgroup by invariants that do not depend on how either was built.
//
// HYPOTHESES, written before any run of this file (none of its numbers was printed before the gate run).
//  H1 THE ORDER. The orthogonal maps of R^4 that permute the 24 slot roots number 1,152.
//  H2 A REFLECTION GROUP. Exactly 24 of them are reflections (det -1, trace 2), and the 24 generate all 1,152.
//  H3 THE CLASSES. The group has 25 conjugacy classes (by orbits, and again by Burnside's count of commuting pairs).
//  H4 THE INVARIANTS. Its Molien series on R^4 equals 1 / prod (1 - t^d) for d = 2, 6, 8, 12 through t^48 (the
//     degrees read off the series itself by peeling, then the whole series compared), with prod d = 1,152 and
//     sum (d - 1) = 24, the reflection count (Chevalley's and Shephard-Todd's two identities).
//     H1 to H4 together are W(F4), the symmetry group of the 24-cell.
//  H5 THE FRAME-KEEPING SUBGROUP. The elements sending each of the three frames (the dock's pair partitions 01|23,
//     02|13, 03|12) to itself number 192; 12 of them are reflections, and those 12 generate all 192; the subgroup has
//     13 classes and invariant degrees 2, 4, 4, 6 (prod 192, sum (d - 1) = 12). That is W(D4).
//  H6 TRIALITY. Every element sends each frame's 8 roots into one frame; the action on the three frames has image of
//     order 6 and non-abelian (S3), and its kernel is exactly the frame-keeping subgroup: W(F4) / W(D4) = S3, the
//     triality that permutes the three frames.
//  H7 WHICH W(D4) (derived before the run, the part the brief did not ask). The dock's slots are the long roots
//     +-e_i +- e_j. A reflection in a slot direction (say e0 - e1, swapping two axes) fixes the frame 01|23 and swaps
//     the other two, so NO slot reflection keeps the frames: each acts on them as a transposition. The frame-keeping
//     reflections are the ones in the 24 directions that are NOT slots, +-e_i and (+-1, +-1, +-1, +-1) / 2, the short
//     roots, 12 mirrors. So the frame-keeping W(D4) is the short roots' Weyl group, and the 12 slot reflections
//     generate a DIFFERENT W(D4) (order 192, normal, permuting the frames), the two meeting in 32 elements (the
//     axis-pair permutations that keep every pair partition, 4, times the even sign changes, 8) with product all of
//     W(F4).
//  P  FALSIFIER: any count in H1 to H7 differs.
// PREDICTED: every hypothesis holds. This is L1: known mathematics confirmed on the package's own objects. What it
// settles for the model is which group the dock's covariance is, so that "the frames cannot be three generations"
// (E-FRC-0258) reads as a statement about W(D4) inside W(F4).
//
// CONTROLS (a failure makes the verdict partial).
//  C1 THE ROTATIONS ARE NOT A REFLECTION GROUP: the 576 elements of det +1 hold 0 reflections, and peeling their
//     Molien series gives either a series that is not a polynomial ring's or more than 4 degrees or a product of
//     degrees other than 576, so the identification procedure says no on a group of the right kind and size.
//  C2 A DIFFERENT ROOT SET GIVES A DIFFERENT ANSWER: the same construction on the 16-cell's 8 vertices +-e_i gives
//     the hyperoctahedral group: order 384, 16 reflections generating it, 20 classes, degrees 2, 4, 6, 8.
// INSTRUMENT (a failure makes the verdict partial). I1 the group built here equals f4Group() (the textbook-diagram
//  construction) as a set of slot permutations and of matrices. I2 every matrix was within 1e-12 of the half-integer
//  grid before snapping and every kept map is exactly orthogonal. I3 the class sizes sum to the order and each divides
//  it, and the orbit count equals the Burnside count.
// VERDICT, fixed before the run: PASS when H1 to H7 hold with the controls and the instrument; FAIL when any of H1 to
// H7 fails; PARTIAL when a control or the instrument fails.
//
// PRIOR ART: W(F4) as the 24-cell's group and its degrees 2, 6, 8, 12 (Coxeter, Regular Polytopes; Humphreys,
// Reflection Groups and Coxeter Groups, table 3.1); E-MTH-0008 read the same Molien series from the Hurwitz units.
// What is new here is only that the group is built from the slots with no diagram, and the frame-keeping subgroup
// named and located.
//
// FIRST RUN (1.3 s): PASS, as predicted, no gate moved. Rerun once after a lint-only refactor (the slot-mirror group's
// closure moved into code/measure/dock-group generatedKeys; tmp/np-gate-E-GMT-0039.log): every number identical.
//  - The dock group: 1,152 maps, 24 reflections generating all 1,152, 25 classes (Burnside 25), degrees 2, 6, 8, 12 with
//    the series matching through t^48, prod 1,152, sum (d - 1) 24. It equals f4Group() element for element.
//  - Frame-keeping: 192 elements, 12 reflections generating all 192, 13 classes, degrees 2, 4, 4, 6. The frame action has
//    6 images, non-abelian, kernel 192: S3.
//  - H7: the 12 slot mirrors each act on the frames as a transposition and generate a second W(D4) of order 192; the 12
//    frame-keeping mirrors are (1,0,0,0) .. (0,0,0,1) and the eight (1,+-1,+-1,+-1), none a slot; the two W(D4) meet in 32.
//  - C1: the rotations hold 0 reflections, and peeling their series needs a fifth degree (24) and then misses at t^48.
//    C2: the 16-cell gives order 384, 16 reflections, 20 classes, degrees 2, 4, 6, 8.
// WHAT IT MEANS. The dock's covariance group is W(F4), the 24-cell's, and the subgroup that keeps the frames apart is
// a W(D4) that is NOT the Weyl group of the slots: it is generated by mirrors in the 24 directions the dock has no slot
// for. So a rule that told the frames apart would keep only the short mirrors, and E-FRC-0258's three quartics are
// W(D4)'s degrees 2, 4, 4, 6 read at degree 4 (t^4 coefficient 3).
//
// Depth L1. DETERMINISM: no random numbers; the search runs over the slot list in its stored order.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { f4Group, type GroupElement } from '@/code/measure/spinor-register'
import { molien } from '@/code/measure/chiral-register'
import {
  conjugacyClasses,
  determinant,
  frameAction,
  generatedKeys,
  generatedSize,
  peelDegrees,
  reflectionsOf,
  rootSymmetries,
  type Classes,
  type Peel,
} from '@/code/measure/dock-group'

const SERIES = 48
const SNAP = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)
const same = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i])

export default experiment({
  id: 'geometry/dock-group-identity',
  code: 'E-GMT-0039',
  title:
    "the dock's symmetry group, built from its 24 slot roots with no diagram, is W(F4), pass: 1,152 maps, 24 reflections generating all of them, 25 classes, invariant degrees 2, 6, 8, 12 (Molien through t^48); the 192 that keep the three frames are W(D4) (12 reflections generating them, 13 classes, degrees 2, 4, 4, 6) and the quotient S3 permutes the frames (triality); that W(D4) is generated by the 12 mirrors in the short directions +-e_i and (+-1, +-1, +-1, +-1) / 2, none of them a slot, while each of the 12 slot mirrors swaps two frames and together they generate a second W(D4) meeting the first in 32; controls: the 576 rotations hold no reflection and no polynomial invariant ring, and the 16-cell gives the hyperoctahedral group (384, 16 reflections, 20 classes, degrees 2, 4, 6, 8)",
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return dockGroupRun()
  },
})

type Reading = {
  order: number
  reflections: number
  generated: number
  classes: Classes
  peel: Peel
  product: number
  sumMinusOne: number
}

const read = (elements: readonly GroupElement[], reflections: readonly GroupElement[]): Reading => {
  const classes = conjugacyClasses(elements)
  const peel = peelDegrees(molien(elements as GroupElement[], SERIES))

  return {
    order: elements.length,
    reflections: reflections.length,
    generated: generatedSize(reflections),
    classes,
    peel,
    product: peel.degrees.reduce((p, d) => p * d, 1),
    sumMinusOne: peel.degrees.reduce((s, d) => s + d - 1, 0),
  }
}

const isGroup = (r: Reading, want: { order: number; reflections: number; classes: number; degrees: number[] }): boolean =>
  r.order === want.order &&
  r.reflections === want.reflections &&
  r.generated === want.order &&
  r.classes.sizes.length === want.classes &&
  r.classes.burnside === want.classes &&
  r.peel.matches &&
  r.peel.below < 0 &&
  same(r.peel.degrees, want.degrees) &&
  r.product === want.order &&
  r.sumMinusOne === want.reflections

export function dockGroupRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- the group, from the slots ----------------
  const sym = rootSymmetries(DOCK_ROOTS)
  const G = sym.elements
  const reflG = reflectionsOf(G)
  const full = read(
    G,
    reflG.map(r => r.element),
  )

  log('G')

  const H1 = full.order === 1152
  const H2 = full.reflections === 24 && full.generated === 1152
  const H3 = full.classes.sizes.length === 25 && full.classes.burnside === 25
  const H4 =
    full.peel.matches &&
    full.peel.below < 0 &&
    same(full.peel.degrees, [2, 6, 8, 12]) &&
    full.product === 1152 &&
    full.sumMinusOne === 24

  // ---------------- the frames ----------------
  const fa = frameAction(G, DOCK_ROOTS)
  const fixesFrames = (img: readonly number[]): boolean => img.every((v, i) => v === i)
  const F = G.filter((_, i) => fixesFrames(fa.images[i]!))
  const reflF = reflectionsOf(F)
  const keep = read(
    F,
    reflF.map(r => r.element),
  )

  log('F')

  const H5 = isGroup(keep, { order: 192, reflections: 12, classes: 13, degrees: [2, 4, 4, 6] })
  const images = new Set(fa.images.map(i => i.join('')))
  const compose = (a: readonly number[], b: readonly number[]): number[] => b.map(v => a[v]!)
  const imageList = [...images].map(s => s.split('').map(Number))
  const nonAbelian = imageList.some(a => imageList.some(b => compose(a, b).join('') !== compose(b, a).join('')))
  const H6 = fa.consistent && images.size === 6 && nonAbelian && F.length * images.size === G.length

  // ---------------- H7: which W(D4) ----------------
  const slotKeys = new Set(DOCK_ROOTS.map(r => r.join(',')))
  const isSlot = (v: readonly number[]): boolean =>
    slotKeys.has(v.join(',')) || slotKeys.has(v.map(x => -x).join(','))
  const slotReflections = reflG.filter(r => isSlot(r.normal))
  const transpositions = slotReflections.filter(r => {
    const img = fa.images[G.indexOf(r.element)]!

    return img.filter((v, i) => v === i).length === 1
  })
  // a short direction: +-e_i (one nonzero entry) or (+-1, +-1, +-1, +-1) (the doubled (+-1/2)^4: four entries of size 1)
  const isShort = (v: readonly number[]): boolean =>
    v.filter(x => x !== 0).length === 1 || (v.length === 4 && v.every(x => Math.abs(x) === 1))
  const slotGroupKeys = generatedKeys(slotReflections.map(r => r.element))
  const R = slotGroupKeys.size
  const meet = F.filter(e => slotGroupKeys.has(e.slots.join(','))).length
  const H7 =
    slotReflections.length === 12 &&
    transpositions.length === 12 &&
    reflF.length === 12 &&
    reflF.every(r => !isSlot(r.normal) && isShort(r.normal)) &&
    R === 192 &&
    meet === 32 &&
    (R * F.length) / meet === G.length

  log('H7')

  // ---------------- controls ----------------
  const rotations = G.filter(e => determinant(e.matrix) === 1)
  const rot = read(
    rotations,
    reflectionsOf(rotations).map(r => r.element),
  )
  const C1 =
    rot.order === 576 &&
    rot.reflections === 0 &&
    (!rot.peel.matches || rot.peel.below >= 0 || rot.peel.degrees.length > 4 || rot.product !== 576)

  const cross = [0, 1, 2, 3].flatMap(i => [1, -1].map(s => [0, 1, 2, 3].map(j => (i === j ? s : 0))))
  const B4 = rootSymmetries(cross)
  const hyper = read(
    B4.elements,
    reflectionsOf(B4.elements).map(r => r.element),
  )
  const C2 = isGroup(hyper, { order: 384, reflections: 16, classes: 20, degrees: [2, 4, 6, 8] })

  log('controls')

  // ---------------- instrument ----------------
  const textbook = f4Group()
  const key = (e: GroupElement): string => e.slots.join(',')
  const mkey = (e: GroupElement): string => e.matrix.map(r => r.join(',')).join(';')
  const ours = new Set(G.map(key))
  const oursM = new Set(G.map(mkey))
  const I1 =
    textbook.length === G.length &&
    textbook.every(e => ours.has(key(e)) && oursM.has(mkey(e)))
  const I2 = sym.exact && sym.snap <= SNAP && B4.exact && B4.snap <= SNAP
  const classesOk = (c: Classes, order: number): boolean =>
    c.sizes.reduce((s, x) => s + x, 0) === order && c.sizes.every(x => order % x === 0) && c.sizes.length === c.burnside
  const I3 = classesOk(full.classes, G.length) && classesOk(keep.classes, F.length) && classesOk(hyper.classes, B4.elements.length)

  const hard = H1 && H2 && H3 && H4 && H5 && H6 && H7
  const status: Verdict['status'] = !hard ? 'fail' : C1 && C2 && I1 && I2 && I3 ? 'pass' : 'partial'
  const line = (name: string, r: Reading): string =>
    `${name}: order ${r.order}, reflections ${r.reflections} generating ${r.generated}, classes ${r.classes.sizes.length} (Burnside ${r.classes.burnside}), degrees ${r.peel.degrees.join(', ')} (series ${r.peel.matches ? 'matches' : 'does not match'}${r.peel.below >= 0 ? `, below the ring at t^${r.peel.below}` : ''}), prod ${r.product}, sum (d - 1) ${r.sumMinusOne}`

  return verdict({
    status,
    claim: `H1 ${H1} H2 ${H2} H3 ${H3} H4 ${H4} (${line('the dock group', full)}); H5 ${H5} (${line('frame-keeping', keep)}); H6 ${H6} (frame images ${images.size}, ${nonAbelian ? 'non-abelian' : 'abelian'}, consistent ${fa.consistent}, kernel ${F.length}); H7 ${H7} (slot reflections ${slotReflections.length}, each a transposition of the frames ${transpositions.length}; frame-keeping reflections ${reflF.length}, normals ${[...new Set(reflF.map(r => r.normal.join(' ')))].length} distinct, all short and none a slot ${reflF.every(r => !isSlot(r.normal) && isShort(r.normal))}; the slot reflections generate ${R}, meeting the frame-keeping subgroup in ${meet}); controls C1 ${C1} (${line('rotations', rot)}) C2 ${C2} (${line('16-cell', hyper)}); instrument I1 ${I1} I2 ${I2} (snap ${sym.snap.toExponential(2)}) I3 ${I3}`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      H5: flag(H5),
      H6: flag(H6),
      H7: flag(H7),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      order: full.order,
      reflections: full.reflections,
      classes: full.classes.sizes.length,
      frameKeepingOrder: F.length,
      frameKeepingReflections: keep.reflections,
      frameKeepingClasses: keep.classes.sizes.length,
      frameImages: images.size,
      slotReflectionGroup: R,
      meet,
      rotationReflections: rot.reflections,
      hyperoctahedralOrder: hyper.order,
      hyperoctahedralClasses: hyper.classes.sizes.length,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      rotationReflections: rot.reflections,
      rotationDegrees: rot.peel.degrees.length,
      hyperoctahedralReflections: hyper.reflections,
    },
    notes: `L1. Class sizes, dock group: ${full.classes.sizes.join(' ')}; frame-keeping: ${keep.classes.sizes.join(' ')}. Molien coefficients 0 .. 12, dock group: ${molien(G, 12).join(' ')}; frame-keeping: ${molien(F, 12).join(' ')}; rotations: ${molien(rotations, 26).join(' ')}. Frame-keeping mirror normals: ${[...new Set(reflF.map(r => `(${r.normal.join(',')})`))].join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
