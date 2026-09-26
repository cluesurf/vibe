// Are the 216 grid moves a link holds exactly the single-qutrit Clifford group mod phases?
//
// The model's link (E-FRC-0150) holds an element of Sigma(648), built by closure from its published
// generators (code/algebra/group/su3-subgroups), and the grid move is its quotient, the permutation it
// induces on the nine phase-point operators of the role grid (code/rule/sigma-links, through
// code/measure/qutrit-phase-space). The model's list of grid moves is typed as the 216 affine maps of Z3^2
// with determinant 1 (code/rule/vibe-weave gridMoves). The claim under test: that list is ASL(2, 3), the
// qutrit Clifford group mod phases, acting on qutrit phase space, and Sigma(648) is the Clifford group's lift
// to SU(3), so that
//
//   Sigma(648)  = the determinant-1 qutrit Clifford group, the Hessian group of order 648 in SU(3)
//   Z3 center   = the three scalars 1, omega, omega^2, which the Clifford action cannot see
//   216         = Sigma(648) / Z3, the Hessian group in PGL(3), = Clifford mod phases = ASL(2, 3)
//   Z3^2        = the Weyl-Heisenberg displacements mod phase (the image of the clock and shift)
//   SL(2, 3)    = the linear part, the symplectic group of the role grid, the turn group of E-MTH-0009
//
// Measured, on every element:
// 1. Sigma(648): each of the 648 elements permutes the phase points (classical), and each maps every
//    displacement D(v) to a phase times a displacement D(M v), the Clifford property, checked directly
// 2. the conjugation map Sigma(648) -> S9 is a homomorphism (all 648^2 products), its kernel is exactly the 3
//    scalars, and its image, read in the model's own coordinates (sigma-links' toGrid), is the model's list
//    of 216 grid moves, as a set
// 3. the linear part M read from the displacements equals the linear part of the phase-point permutation,
//    every phase is a cube root of unity, and one fixed symplectic rule gives the phase, U D(v) U^dagger =
//    omega^(c [t, M v]) D(M v) with t the translation, for all 648 x 9 cases
// 4. an independent construction: the closure of X, Z, the Fourier gate and the phase gate diag(1, 1, omega),
//    counted up to phase, has 216 elements, and each is a phase times an element of Sigma(648)
// 5. isomorphisms: the abstract isomorphisms between the model's 216 (grid coordinates) and the Clifford
//    action (phase coordinates), counted exhaustively through a generating pair, and the relabelings of the
//    9 points that carry one permutation group onto the other, with the model's own toGrid among them
// 6. the translation subgroup: the grid moves with trivial linear part are 9, the images of the clock and
//    shift
//
// Controls: the qutrit T gate of Howard and Vala (diag(1, e^(2 pi i/9), e^(-2 pi i/9))) must fail both the
// phase-point and the displacement test, with its Clifford-hierarchy level reported; Sigma(1080), another
// finite subgroup of SU(3), must not be all classical; Z3^2 x SL(2, 3), a group of the same order that is
// not the semidirect product, must admit 0 isomorphisms.
//
// Gates, fixed before the first run:
// - 648 of 648 elements classical and Clifford by displacement conjugation
// - homomorphism on all 419,904 products, kernel 3 scalars, image = the 216 grid moves exactly
// - linear parts agree on 648 of 648, all phases cube roots, exactly one of c = 1, 2 holds on all 5,832
// - the independent closure has 216 elements, 216 of them in Sigma(648) up to phase
// - abstract isomorphisms = point relabelings = 432 (the prediction: Aut(ASL(2, 3)) = AGL(2, 3), since the
//   translations are characteristic, the centralizer of the translations is the translations, and the
//   central -1 of SL(2, 3) kills H^1(SL(2, 3), F3^2)), and toGrid among the relabelings
// - 9 translations, all images of the Heisenberg group
// - controls: T fails both tests, Sigma(1080) has non-classical elements, the direct product gives 0
//
// Reported, not gated: the convention of code/rule/fear-weave, which applies moves.act (grid index a + 3 b)
// to a whole's coordinates, which its kernels read as phase index 3 a + b. The swap (a, b) -> (b, a) has
// determinant -1 and normalizes ASL(2, 3), so every link still applies a Clifford move, but the move is the
// transpose of the grid move's own: counted here, with whether the transposed set is the same 216.
//
// First run, 2026-09-25: every gate passed as fixed. The phase rule that holds is c = 2, U D(v) U^dagger =
// omega^(-[t, M v]) D(M v) on all 5,832 cases (c = 1 holds on 72 of 648 elements, those with t = 0). 432
// isomorphisms and 432 relabelings, as predicted. Sigma(1080) has 18 classical elements of 1080. 210 of the
// 216 grid moves differ from their transpose, and all 216 transposes are grid moves.
//
// Depth L1: known mathematics (Gottesman 1998, Appleby 2005, Gross 2006, Grimus and Ludl 2010), checked
// exactly on the model's own objects. The Hessian group of order 216 is known to be the qutrit Clifford
// group mod phases; the finding is that the model's links are that group on the nose, not a claim of novelty.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { generateGroup, matrix3, multiply3, toSpecial, type Matrix3 } from '@/code/dynamics/finite-gauge'
import { CLOCK, FOURIER, QUTRIT_T, SHIFT, SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { affineOf, phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { gridMoves } from '@/code/rule/vibe-weave'
import { closure, type GroupOps } from '@/code/algebra/group/finite-group'
import {
  elementOrders,
  intertwiningRelabelings,
  isomorphisms,
  PERMUTATION_OPS,
  tableGroup,
} from '@/code/algebra/group/isomorphism'
import { specialLinear, multiplyModP } from '@/code/algebra/group/special-linear'
import { cliffordAction, cliffordLevel, displacementOperators, operatorFrom3 } from '@/code/measure/qutrit-clifford'

const EXPECTED_AUTOMORPHISMS = 432
const KEY_SCALE = 1e6

// the phase point (a, b), index 3 a + b, is the grid point x = a, y = b, index a + 3 b (sigma-links)
const toGrid = (q: number): number => Math.floor(q / 3) + 3 * (q % 3)

function keyOf(m: Matrix3): string {
  return Array.from(m, x => Math.round(x * KEY_SCALE) || 0).join(',')
}

function scale3(m: Matrix3, re: number, im: number): Matrix3 {
  const out = new Float64Array(18)

  for (let k = 0; k < 9; k++) {
    out[2 * k] = (m[2 * k] ?? 0) * re - (m[2 * k + 1] ?? 0) * im
    out[2 * k + 1] = (m[2 * k] ?? 0) * im + (m[2 * k + 1] ?? 0) * re
  }

  return out
}

// a key blind to a global phase: the determinant-1 representative, then the least of its three cube-root
// multiples
function phaseFreeKey(m: Matrix3): string {
  const s = toSpecial(m)

  return [0, 1, 2]
    .map(k => keyOf(scale3(s, Math.cos((2 * Math.PI * k) / 3), Math.sin((2 * Math.PI * k) / 3))))
    .sort()[0] ?? ''
}

function dagger(m: Matrix3): Matrix3 {
  const out = new Float64Array(18)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[2 * (3 * i + j)] = m[2 * (3 * j + i)] ?? 0
      out[2 * (3 * i + j) + 1] = -(m[2 * (3 * j + i) + 1] ?? 0)
    }
  }

  return out
}

const MATRIX_OPS: GroupOps<Matrix3> = {
  multiply: multiply3,
  inverse: dagger,
  key: phaseFreeKey,
}

// the symplectic product [x, y] = x1 y2 - x2 y1 on Z3^2, v = 3 a + b as (a, b)
const symplectic = (x: number, y: number): number => (((Math.floor(x / 3) * (y % 3) - (x % 3) * Math.floor(y / 3)) % 3) + 3) % 3

export default experiment({
  id: 'quantum/links-are-the-clifford-group',
  code: 'E-QTM-0117',
  title:
    'the links are the qutrit Clifford group: Sigma(648) is the determinant-1 lift of the single-qutrit Clifford group, every element maps each Weyl-Heisenberg displacement to a phase times a displacement, its quotient by the 3 central scalars is the model\'s 216 grid moves exactly, and those are ASL(2, 3) acting on the role grid as qutrit phase space, with 432 isomorphisms, every one a relabeling of the nine points',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // 1. Sigma(648), classical and Clifford
    const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators, limit: 4000 })
    const d1 = displacementOperators(1)
    const maps = group.matrices.map(m => phaseSpaceAction({ unitary: m }))
    const classical = maps.filter(m => m !== undefined).length
    const actions = group.matrices.map(m => cliffordAction(operatorFrom3(m), d1))
    const clifford = actions.filter(a => a !== undefined).length

    // 2. homomorphism, kernel, image
    const perm = maps.map(m => m ?? [0, 1, 2, 3, 4, 5, 6, 7, 8])
    let homomorphismFailures = 0

    for (let a = 0; a < group.order; a++) {
      for (let b = 0; b < group.order; b++) {
        const ab = group.product[a * group.order + b] ?? 0
        const composed = (perm[b] ?? []).map(p => perm[a]?.[p] ?? p)

        homomorphismFailures += composed.every((x, i) => x === perm[ab]?.[i]) ? 0 : 1
      }
    }

    const identityPerm = '0,1,2,3,4,5,6,7,8'
    const kernel = perm.map((p, g) => [p.join(','), g] as const).filter(([k]) => k === identityPerm).map(([, g]) => g)
    const kernelScalar = kernel.every(g => {
      const m = group.matrices[g] ?? new Float64Array(18)

      return [1, 2, 3, 5, 6, 7].every(k => Math.hypot(m[2 * k] ?? 0, m[2 * k + 1] ?? 0) < 1e-9) && Math.hypot((m[0] ?? 0) - (m[8] ?? 0), (m[1] ?? 0) - (m[9] ?? 0)) < 1e-9 && Math.hypot((m[0] ?? 0) - (m[16] ?? 0), (m[1] ?? 0) - (m[17] ?? 0)) < 1e-9
    })
    const toGridTable = (p: readonly number[]): string => {
      const table = new Array<number>(9)

      p.forEach((image, q) => (table[toGrid(q)] = toGrid(image)))

      return table.join(',')
    }
    const imageInGrid = new Set(perm.map(toGridTable))
    const grid = gridMoves()
    const gridSet = new Set(grid.act.map(t => Array.from(t).join(',')))
    const imageEqualsGrid = imageInGrid.size === gridSet.size && [...imageInGrid].every(k => gridSet.has(k))

    // 3. linear parts and phases
    const omegaPowerOf = ([re, im]: [number, number]): number => {
      for (let k = 0; k < 3; k++) {
        if (Math.hypot(re - Math.cos((2 * Math.PI * k) / 3), im - Math.sin((2 * Math.PI * k) / 3)) < 1e-8) {
          return k
        }
      }

      return -1
    }
    let linearAgree = 0
    let cubeRootPhases = 0
    const conventionHolds = [0, 0, 0]

    group.matrices.forEach((_, g) => {
      const act = actions[g]
      const affine = affineOf({ map: perm[g] ?? [] })

      if (!act || !affine) {
        return
      }

      // M e1 and M e2 from the displacements D(1, 0) (index 3) and D(0, 1) (index 1)
      const e1 = act.images[3] ?? 0
      const e2 = act.images[1] ?? 0
      const fromDisplacement = [Math.floor(e1 / 3), Math.floor(e2 / 3), e1 % 3, e2 % 3]

      linearAgree += fromDisplacement.every((x, i) => x === affine.matrix[i]) ? 1 : 0

      const t = 3 * affine.shift[0] + affine.shift[1]
      const powers = act.phases.map(omegaPowerOf)

      cubeRootPhases += powers.every(k => k >= 0) ? 1 : 0

      for (const c of [1, 2]) {
        conventionHolds[c] = (conventionHolds[c] ?? 0) + (powers.every((k, v) => k === (c * symplectic(t, act.images[v] ?? 0)) % 3) ? 1 : 0)
      }
    })

    // 4. the independent closure: X, Z, Fourier, phase gate, up to phase
    const X = SHIFT
    const Z = CLOCK
    const PHASE = matrix3([
      [
        [1, 0],
        [0, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [1, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [0, 0],
        [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)],
      ],
    ])
    const independent = closure([X, Z, FOURIER, PHASE], MATRIX_OPS)
    const sigmaKeys = new Set(group.matrices.map(phaseFreeKey))
    const independentInSigma = independent.filter(m => sigmaKeys.has(phaseFreeKey(m))).length
    const independentClifford = independent.filter(m => cliffordAction(operatorFrom3(m), d1) !== undefined).length

    // 5. isomorphisms: the model's 216 (grid coordinates) and the Clifford action (phase coordinates)
    const modelPerms = grid.act.map(t => Array.from(t))
    const cliffordPerms = [...new Map(perm.map(p => [p.join(','), p])).values()]
    const modelGroup = tableGroup(modelPerms, PERMUTATION_OPS)
    const cliffordGroup = tableGroup(cliffordPerms, PERMUTATION_OPS)
    const abstract = isomorphisms(modelGroup, cliffordGroup).length
    const modelGenerators = (() => {
      const orders = elementOrders(modelGroup)
      // the generating pair the isomorphism count used is inside isomorphisms; take one here for relabelings
      for (let a = 0; a < modelGroup.order; a++) {
        for (let b = a + 1; b < modelGroup.order; b++) {
          if ((orders[a] ?? 0) >= 3 && (orders[b] ?? 0) >= 3 && new Set(closure([modelPerms[a] ?? [], modelPerms[b] ?? []], PERMUTATION_OPS).map(p => p.join(','))).size === 216) {
            return [modelPerms[a] ?? [], modelPerms[b] ?? []]
          }
        }
      }

      return []
    })()
    const relabelings = intertwiningRelabelings({ source: modelPerms, sourceGenerators: modelGenerators, target: cliffordPerms })
    // toGrid read backwards: grid index p -> phase index q
    const gridToPhase = Array.from({ length: 9 }, (_, p) => 3 * (p % 3) + Math.floor(p / 3))
    const cliffordSet = new Set(cliffordPerms.map(p => p.join(',')))
    const toGridIntertwines = modelPerms.every(g => {
      const phaseToGrid = Array.from({ length: 9 }, (_, q) => toGrid(q))
      const conjugated = Array.from({ length: 9 }, (_, q) => gridToPhase[g[phaseToGrid[q] ?? 0] ?? 0] ?? 0)

      return cliffordSet.has(conjugated.join(','))
    })

    // 6. translations: trivial linear part, and the Heisenberg group's images
    // grid index p = x + 3 y: the move is a translation when t(p) - t(0) = p for p = e_x (1) and e_y (3)
    const translations = grid.act.filter(t => {
      const s = t[0] ?? 0

      return [1, 3].every(p => {
        const dx = (((t[p] ?? 0) % 3) - (s % 3) + 3) % 3
        const dy = (Math.floor((t[p] ?? 0) / 3) - Math.floor(s / 3) + 3) % 3

        return dx + 3 * dy === p
      })
    }).length
    const heisenberg = generateGroup({ generators: [CLOCK, SHIFT], limit: 100 })
    const heisenbergImages = new Set(heisenberg.matrices.map(m => toGridTable(phaseSpaceAction({ unitary: m }) ?? []))).size

    // controls
    const tClassical = phaseSpaceAction({ unitary: QUTRIT_T }) !== undefined
    const tClifford = cliffordAction(operatorFrom3(QUTRIT_T), d1) !== undefined
    const tLevel = cliffordLevel(operatorFrom3(QUTRIT_T), d1, 4)
    const sigma1080 = generateGroup({ generators: SU3_SUBGROUPS.sigma1080.generators, limit: 4000 })
    const sigma1080Classical = sigma1080.matrices.filter(m => phaseSpaceAction({ unitary: m }) !== undefined).length
    const sl = specialLinear(3)
    type Pair = { t: [number, number]; m: readonly [number, number, number, number] }
    const directOps: GroupOps<Pair> = {
      multiply: (x, y) => ({ t: [(x.t[0] + y.t[0]) % 3, (x.t[1] + y.t[1]) % 3], m: multiplyModP(x.m, y.m, 3) }),
      // not used: tableGroup reads only multiply and key
      inverse: x => x,
      key: x => `${x.t.join(',')}|${x.m.join(',')}`,
    }
    const directElements: Pair[] = []

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        for (const m of sl) {
          directElements.push({ t: [a, b], m })
        }
      }
    }

    const directIsomorphisms = isomorphisms(tableGroup(directElements, directOps), cliffordGroup).length

    // the fear weave's convention: moves.act applied to phase-indexed coordinates is the transposed move
    // the move a grid move g is on phase indices: swap g swap, swap the index change a + 3 b <-> 3 a + b.
    // The fear weave applies g itself to phase indices, so it applies this move's transpose
    const swap = (i: number): number => 3 * (i % 3) + Math.floor(i / 3)
    const transpose = (t: Int8Array): string => Array.from({ length: 9 }, (_, q) => swap(t[swap(q)] ?? 0)).join(',')
    const transposedDiffer = grid.act.filter(t => transpose(t) !== Array.from(t).join(',')).length
    const transposedInSet = grid.act.filter(t => gridSet.has(transpose(t))).length

    const ok =
      group.order === 648 &&
      classical === 648 &&
      clifford === 648 &&
      homomorphismFailures === 0 &&
      kernel.length === 3 &&
      kernelScalar &&
      imageEqualsGrid &&
      imageInGrid.size === 216 &&
      linearAgree === 648 &&
      cubeRootPhases === 648 &&
      ((conventionHolds[1] === 648) !== (conventionHolds[2] === 648)) &&
      independent.length === 216 &&
      independentInSigma === 216 &&
      independentClifford === 216 &&
      abstract === EXPECTED_AUTOMORPHISMS &&
      relabelings === EXPECTED_AUTOMORPHISMS &&
      toGridIntertwines &&
      translations === 9 &&
      heisenbergImages === 9 &&
      !tClassical &&
      !tClifford &&
      sigma1080Classical < sigma1080.order &&
      directIsomorphisms === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all 648 elements of Sigma(648) are Clifford (each maps every displacement to a cube-root phase times a displacement, by one symplectic rule) and classical on the grid; conjugation is a homomorphism with kernel the 3 central scalars and image exactly the model\'s 216 grid moves; X, Z, Fourier and the phase gate close on 216 elements up to phase, all in Sigma(648); the model\'s 216 and the Clifford action admit 432 isomorphisms and 432 point relabelings, AGL(2, 3), so the links are the qutrit Clifford group mod phases, ASL(2, 3), and Sigma(648) its determinant-1 lift',
      metrics: {
        sigma648Order: group.order,
        classicalElements: classical,
        cliffordElements: clifford,
        homomorphismFailures,
        kernelSize: kernel.length,
        kernelScalar: kernelScalar ? 1 : 0,
        imageSize: imageInGrid.size,
        imageEqualsModelGridMoves: imageEqualsGrid ? 1 : 0,
        linearPartsAgree: linearAgree,
        cubeRootPhaseElements: cubeRootPhases,
        symplecticRuleC1Holds: conventionHolds[1] ?? 0,
        symplecticRuleC2Holds: conventionHolds[2] ?? 0,
        independentCliffordOrder: independent.length,
        independentInSigma648: independentInSigma,
        independentPassDisplacementTest: independentClifford,
        abstractIsomorphisms: abstract,
        pointRelabelings: relabelings,
        modelToGridIsARelabeling: toGridIntertwines ? 1 : 0,
        translations,
        heisenbergImages,
        fearWeaveTransposedMovesDiffering: transposedDiffer,
        fearWeaveTransposedMovesInSet: transposedInSet,
      },
      control: {
        qutritTClassical: tClassical ? 1 : 0,
        qutritTClifford: tClifford ? 1 : 0,
        qutritTHierarchyLevel: tLevel,
        sigma1080Order: sigma1080.order,
        sigma1080Classical,
        directProductIsomorphisms: directIsomorphisms,
        predictedAutomorphisms: EXPECTED_AUTOMORPHISMS,
      },
      notes:
        'L1, exact up to 1e-8 on 3 x 3 matrices. Which is which: Sigma(648) = Sigma(216 x 3), the Hessian group in SU(3), is the determinant-1 qutrit Clifford group; its center {1, omega, omega^2} is invisible to the Clifford action; Sigma(648)/Z3 = the Hessian group of order 216 in PGL(3) = Clifford mod phases = ASL(2, 3) = the model\'s grid moves; the 9 translations are the displacements (the clock and shift, Delta(27) mod its center, the free subgroup of E-FRC-0174); the linear part SL(2, 3) is the role grid\'s turn group (E-MTH-0009). The ninth root in Sigma(648)\'s generator D = diag(e, e, e omega), e = e^(4 pi i / 9), is a global phase that brings the Clifford phase gate diag(1, 1, omega) to determinant 1; it is not the ninth-root T gate, which the controls show is non-Clifford. The fear weave applies moves.act (grid index a + 3 b) to whole coordinates its kernels read as 3 a + b: every link there is still a Clifford move, the transpose of its own, a convention mismatch with sigma-links, not a physics error.',
    })
  },
})
