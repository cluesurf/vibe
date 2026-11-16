// Which mesh does an experiment build? (vibe-roadmap-board-0024)
//
// The `3434` tag and an experiment's title say nothing reliable about the mesh it runs on: on 2026-11-12 1,016 files
// carried the tag, box runs included. This module reads the code instead. It parses every module under code/ and
// test/ (syntax only, no type checker), and from an experiment file follows every identifier it references to the
// top-level declaration that defines it, across imports, re-exports and namespace imports, declaration by
// declaration (never the whole module, so a helper module that also builds a box elsewhere does not taint a caller
// that never touches that function). A walk stops at a BUILDER, a declaration that constructs a mesh, and records
// its mesh kind. The kinds:
//
//   d4-box               the flat periodic D4 box (and the flat D4 husk quotient), the stand-in
//   honeycomb-ball       a finite ball of the true {3,4,3,4} honeycomb, exact or float, with a frontier
//   honeycomb-cusp       the cusp neighborhood of the honeycomb (layer cells modulo cusp translations, or a region)
//   honeycomb-quotient   a finite quotient of the honeycomb by a subgroup of its frame group (no frontier)
//   cubic                a hypercubic Z^d grid or torus (2d, 3d or 4d), including the octree husk stand-ins
//   ring                 a one-dimensional ring or chain
//   other                any other graph (the {7,3} heptagrid, the {5,3,4} dodecagrid, Bethe trees, causal sets,
//                        random geometric graphs, Coxeter tilings of a symbol other than {3,4,3,4})
//
// An experiment that reaches no builder runs on no mesh it builds through shared code. Its own body is then checked
// for an inline D4 box (the D4 roots and a side with a modulus), and otherwise it is `none`: algebra, a closed form,
// or a toy with no mesh.
//
// Two kinds of builder are decided at the call site, not by reach:
// - DISPATCH: makeVibeWeave and makeColorWeave build the D4 box when called with a `side`, and take a given mesh
//   when called with `mesh`. A call whose argument holds a `side` property is a box; otherwise the mesh comes from
//   whatever built it, which the walk reaches on its own.
// - SYMBOLIC: the generic Coxeter engines build whatever symbol they are given. A call whose argument text holds
//   3, 4, 3, 4 (or '3434') is a honeycomb ball; otherwise `other`.
//
// It over-approximates in one way: a reached function counts even when the experiment only calls it on a branch it
// never takes. It under-approximates in one: a mesh built inline from raw arithmetic, other than the D4 box, reads
// `none`. Both are why every label carries its evidence (the builder names) for a reader to check.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import ts from 'typescript'

export const MESH_KINDS = [
  'd4-box',
  'honeycomb-ball',
  'honeycomb-cusp',
  'honeycomb-quotient',
  'cubic',
  'ring',
  'other',
  'none',
] as const

export type MeshKind = (typeof MESH_KINDS)[number]

// builders named one by one: module (relative to the package root, no extension), export name, mesh
const NAMED_BUILDERS: readonly [string, string, MeshKind][] = [
  // the flat D4 box and its relatives
  ['code/substrate/d4-box-integer', 'd4BoxMesh', 'd4-box'],
  ['code/substrate/d4-torus', 'buildD4Torus', 'd4-box'],
  ['code/tool/mesh', 'd4Mesh', 'd4-box'],
  ['code/tool/mesh', 'd4MeshWithRest', 'd4-box'],
  ['code/measure/husk-sound-box', 'boxMeshD4', 'd4-box'],
  ['code/measure/swap-sector', 'flatBoxTables', 'd4-box'],
  ['code/measure/swap-sector', 'd4Ball', 'd4-box'],
  ['code/measure/dispersal', 'd4FlatNeighbors', 'd4-box'],
  ['code/operator/d4-lattice-gas', 'streamD4', 'd4-box'],
  ['code/operator/d4-lattice-gas', 'streamD4Inverse', 'd4-box'],
  ['code/operator/toric-code', 'd4CellComplex', 'd4-box'],
  ['code/rule/photon-links', 'photonLatticeD4', 'd4-box'],
  ['code/measure/cusp-bloch', 'flatQuotient', 'd4-box'],
  ['code/measure/swap-sector', 'd4Steps', 'd4-box'],
  ['code/measure/frame-cone', 'd4Steps', 'd4-box'],
  ['code/measure/route-free-meson', 'd4Distance', 'd4-box'],
  ['code/measure/nucleon-gas', 'd4GraphDistance', 'd4-box'],
  // the true honeycomb, a ball
  ['code/substrate/coxeter/label-transport', 'buildHyperbolicBall', 'honeycomb-ball'],
  ['code/substrate/coxeter/label-transport', 'labelTransports', 'honeycomb-ball'],
  ['code/substrate/coxeter/label-transport', 'bulkDistance', 'honeycomb-ball'],
  ['code/substrate/coxeter/exact-3434', 'buildExactBall', 'honeycomb-ball'],
  ['code/substrate/coxeter/exact-ball-mesh', 'exactBallMesh', 'honeycomb-ball'],
  ['code/substrate/coxeter/labelled-region', 'buildLabelledRegion', 'honeycomb-ball'],
  ['code/substrate/coxeter/exact-cusp', 'coverBall', 'honeycomb-ball'],
  ['code/measure/hyperbolic-lines', 'ballTables', 'honeycomb-ball'],
  ['code/measure/hyperbolic-lines', 'loopFrames', 'honeycomb-ball'],
  // the true honeycomb, at a cusp
  ['code/substrate/coxeter/label-transport', 'cuspLayer', 'honeycomb-cusp'],
  ['code/substrate/coxeter/labelled-region', 'cuspRegion', 'honeycomb-cusp'],
  ['code/substrate/coxeter/exact-cusp', 'buildExactCusp', 'honeycomb-cusp'],
  ['code/substrate/coxeter/exact-cusp', 'cuspTranslations', 'honeycomb-cusp'],
  ['code/measure/cusp-bloch', 'cuspQuotient', 'honeycomb-cusp'],
  ['code/measure/cusp-green', 'buildCuspQuotient', 'honeycomb-cusp'],
  // the true honeycomb, a finite quotient
  ['code/substrate/coxeter/quotient-3434', 'buildQuotient3434', 'honeycomb-quotient'],
  ['code/substrate/coxeter/quotient-3434', 'cuspTorus', 'honeycomb-quotient'],
  ['code/substrate/coxeter/quotient-3434', 'quotientSystole', 'honeycomb-quotient'],
  ['code/substrate/coxeter/quotient-3434', 'quotientOrders', 'honeycomb-quotient'],
  ['code/substrate/coxeter/congruence-3434', 'enumerateFrames', 'honeycomb-quotient'],
  ['code/substrate/coxeter/congruence-3434', 'enumerateLayered', 'honeycomb-quotient'],
  ['code/substrate/coxeter/congruence-3434', 'quotientMesh', 'honeycomb-quotient'],
  // hypercubic grids
  ['code/substrate/cubic-lattice', 'cubicLattice', 'cubic'],
  ['code/tool/mesh', 'cubicMesh', 'cubic'],
  ['code/tool/mesh', 'squareMesh', 'cubic'],
  ['code/substrate/geometric-mesh', 'squareLatticeMesh', 'cubic'],
  ['code/substrate/torus-grid', 'torusGrid', 'cubic'],
  ['code/rule/open-husk', 'openMesh', 'cubic'],
  ['code/measure/horizon-husk', 'tornMesh', 'cubic'],
  ['code/measure/hurwitz-gauge', 'hypercubicLattice', 'cubic'],
  ['code/measure/cusp-green', 'cubicGraph', 'cubic'],
  ['code/rule/lattice-qed', 'squareLattice', 'cubic'],
  ['code/dynamics/gauge-lattice', 'makeGaugeLattice', 'cubic'],
  ['code/dynamics/finite-gauge', 'makeFiniteGaugeLattice', 'cubic'],
  ['code/dynamics/center-gauge', 'makeCenterLattice', 'cubic'],
  ['code/dynamics/link-set-gauge', 'makeLinkSetLattice', 'cubic'],
  ['code/operator/maxwell-lattice', 'maxwellLatticeMatrix', 'cubic'],
  ['code/operator/maxwell-lattice', 'applyMaxwell', 'cubic'],
  ['code/operator/maxwell-lattice', 'linkField', 'cubic'],
  ['code/operator/maxwell-lattice', 'gradientLinkField', 'cubic'],
  ['code/operator/tight-binding', 'torusHoppingHamiltonian', 'cubic'],
  ['code/operator/tight-binding', 'staggeredMassCubicHamiltonian', 'cubic'],
  ['code/operator/tight-binding', 'gridPotentialApply', 'cubic'],
  ['code/operator/tight-binding', 'ringHoppingHamiltonian', 'ring'],
  ['code/operator/tight-binding', 'weakBondChainHamiltonian', 'ring'],
  ['code/operator/tight-binding', 'mediatorChainHamiltonian', 'ring'],
  ['code/operator/tight-binding', 'staggeredMassChainHamiltonian', 'ring'],
  ['code/operator/tight-binding', 'openChainPotentialApply', 'ring'],
  ['code/dynamics/conserving-sweep', 'conservingChainSweep', 'ring'],
  ['code/dynamics/conserving-sweep', 'conservingRingSweep', 'ring'],
  ['code/dynamics/conserving-sweep', 'conservingRingSweepTunable', 'ring'],
  // rings
  ['code/dynamics/conserving-sweep', 'evolveConservingRing', 'ring'],
  ['code/dynamics/clock-winding', 'stepClockRing', 'ring'],
  ['code/measure/event-symmetry', 'ringLattice', 'ring'],
  // one mesh line of the box run as its ring (E-SPN-0104's ring form)
  ['code/measure/held-cluster', 'axisRing', 'ring'],
  ['code/measure/held-cluster', 'fitRing', 'ring'],
  ['code/measure/held-cluster', 'placeRing', 'ring'],
  ['code/measure/coined-line-bloch', 'ringBeat', 'ring'],
  // other graphs
  ['code/tool/mesh', 'betheMesh', 'other'],
  ['code/substrate/geometric-mesh', 'randomGeometricMesh', 'other'],
  ['code/substrate/margenstern/grid', 'buildMargensternGrid', 'other'],
  ['code/measure/hurwitz-gauge', 'triangleLattice', 'other'],
  ['code/measure/color-ensemble', 'triangleLattice', 'other'],
]

// whole modules whose every export builds one kind of mesh
const MODULE_BUILDERS: readonly [string, MeshKind][] = [
  ['code/substrate/ring', 'ring'],
  ['code/substrate/bethe-tree', 'other'],
  ['code/substrate/causal-lattice', 'other'],
  ['code/substrate/sprinkle-box', 'other'],
  ['code/substrate/sprinkle-curved', 'other'],
  ['code/substrate/sprinkle-desitter', 'other'],
  ['code/substrate/sprinkle-minkowski', 'other'],
  ['code/substrate/modular-mesh', 'other'],
  ['code/substrate/psl-cayley', 'other'],
  ['code/substrate/regular-graph', 'other'],
  ['code/substrate/triangulated-surface', 'other'],
  ['code/substrate/tiling-pq', 'other'],
  ['code/substrate/growing-pentagrid', 'other'],
  ['code/substrate/radial-tree', 'other'],
  ['code/substrate/perfect-tensor-tree', 'other'],
  ['code/substrate/hyperbolic-graph', 'other'],
  ['code/substrate/hyperbolic-honeycomb', 'other'],
  ['code/substrate/proximity-graph', 'other'],
  ['code/substrate/grow-csg', 'other'],
  ['code/substrate/graph-rewrite', 'other'],
  ['code/substrate/margenstern/grid', 'other'],
  ['code/substrate/coxeter/addressing-3434', 'honeycomb-ball'],
  ['code/substrate/coxeter/streaming-shell-count', 'honeycomb-ball'],
  ['code/substrate/mesh-unfolding', 'honeycomb-ball'],
  ['code/substrate/coxeter/cell-scale', 'other'],
  ['code/substrate/lattice', 'cubic'],
  ['code/dynamics/quantum-walk', 'ring'],
  // the husk stand-ins: a periodic cubic husk box or a cubic lattice in momentum space
  ['code/measure/stand-in-hydrogen', 'cubic'],
  ['code/measure/standin-chemistry', 'cubic'],
  ['code/measure/stand-in-atom', 'cubic'],
  ['code/measure/standin-atoms', 'cubic'],
  ['code/operator/lattice-fermion', 'cubic'],
  ['code/operator/overlap-boundary', 'cubic'],
  ['code/operator/overlap-condensate', 'cubic'],
  ['code/operator/overlap-su2', 'cubic'],
  ['code/operator/lattice-green-kspace', 'cubic'],
  ['code/rule/trit-radion', 'cubic'],
  ['code/rule/step-depth', 'cubic'],
  // one husk line, a ladder of husk squares, or a ring: one-dimensional
  ['code/rule/plaquette-ladder', 'ring'],
  ['code/measure/quantum-ladder', 'ring'],
  ['code/rule/loop-ring', 'ring'],
  ['code/measure/drift-cost-bloch', 'ring'],
  ['code/measure/locked-run', 'ring'],
  ['code/measure/flux-store-bloch', 'ring'],
  ['code/rule/locked-token-line', 'ring'],
  ['code/rule/drift-cost-line', 'ring'],
  ['code/rule/flux-store-line', 'ring'],
]

// box when called with a `side`, the given mesh when called with `mesh`
const DISPATCH: readonly [string, string][] = [
  ['code/rule/vibe-weave', 'makeVibeWeave'],
  ['code/rule/color-weave', 'makeColorWeave'],
  // a number is the box's side, { mesh, store } a given mesh
  ['code/measure/doublet-locked-readings', 'lockedFresh'],
  // roles on build the box weave of a side; without roles the mesh is given
  ['code/rule/cold-weave', 'makeColdWeave'],
]

const HONEYCOMB_SYMBOL = /3,\s*4,\s*3,\s*4|'3434'|SYMBOL_3434|HONEYCOMB_SYMBOL/

// generic builders: the call's argument text, or failing that the text of the declaration that makes the call and
// of the experiment file, decides the kind. A Coxeter engine given {3,4,3,4} builds the honeycomb; a horosphere of
// it is the cusp; a lattice ball generated by the D4 roots is the flat D4 lattice
const CALLSITE: readonly [string, string, (text: string) => MeshKind][] = [
  ...(
    [
      ['code/substrate/coxeter/engine', 'buildCoxeterMesh'],
      ['code/substrate/coxeter/word', 'buildWordMesh'],
      ['code/substrate/coxeter/matrix-group', 'buildCoxeterMatrixMesh'],
      ['code/substrate/coxeter/cell-direct', 'buildCellGraph'],
      ['code/substrate/coxeter/tessellation', 'buildTessellation'],
      ['code/substrate/coxeter', 'coxeterMeshGraph'],
      ['code/substrate/coxeter', 'coxeterTessellation'],
      ['code/substrate/coxeter/lazy-tiling', 'makeLazyTiling'],
    ] as const
  ).map(
    ([module, name]) =>
      [
        module,
        name,
        (text: string): MeshKind =>
          HONEYCOMB_SYMBOL.test(text) ? 'honeycomb-ball' : 'other',
      ] as [string, string, (text: string) => MeshKind],
  ),
  ...(
    [
      ['code/substrate/coxeter/cell-direct', 'buildHorosphere'],
      ['code/substrate/coxeter/cell-direct', 'buildHorosphereBand'],
    ] as const
  ).map(
    ([module, name]) =>
      [
        module,
        name,
        (text: string): MeshKind =>
          HONEYCOMB_SYMBOL.test(text) ? 'honeycomb-cusp' : 'other',
      ] as [string, string, (text: string) => MeshKind],
  ),
  [
    'code/substrate/coxeter/cell-direct',
    'buildEuclideanLattice',
    (text: string): MeshKind => (/3,\s*4,\s*3/.test(text) ? 'd4-box' : 'cubic'),
  ],
  [
    'code/substrate/lattice-ball',
    'latticeBall',
    (text: string): MeshKind => (/D4|d4/.test(text) ? 'd4-box' : 'cubic'),
  ],
]

// an inline D4 box in a reached declaration's own code: the D4 roots and a periodic side
const INLINE_ROOTS = /\b(rootsD4|D4_ROOTS|d4Directions|D4_DIRECTIONS|DOCK_ROOTS)\b/
const INLINE_WRAP = /%\s*(side|SIDE|L)\b|\b(side|L)\s*\*\*\s*4\b|\bside\s*\*\s*side\s*\*\s*side\b/
// a band on the flat D4 lattice: the D4 roots inside a plane wave, sin or cos of K . r (no box, the infinite flat lattice)
const INLINE_BLOCH = /Math\.(sin|cos)\(/

type Declaration = { readonly nodes: ts.Node[] }

type Module = {
  readonly path: string
  readonly declarations: Map<string, Declaration>
  // local name -> [module path, exported name]
  readonly imports: Map<string, [string, string]>
  // local namespace name -> module path
  readonly namespaces: Map<string, string>
  // exported name -> [module path, name there], for `export { x } from` and `export { x as y } from`
  readonly reexports: Map<string, [string, string]>
  // `export * from` targets
  readonly starExports: string[]
  readonly source: ts.SourceFile
}

export type MeshReach = {
  readonly meshes: MeshKind[]
  // the builders reached, as `kind:name`
  readonly evidence: string[]
  // the working rule (code/rule/coined-locked-knit) is reached
  readonly workingRule: boolean
  // the box's working vacuum store (code/measure/dense-hub storeOfKind, E-RLT-0105) is reached
  readonly boxStore: boolean
  // any rule under code/rule is reached: the run has dynamics, so a ball's horizon matters
  readonly runsRule: boolean
}

const key = (path: string, name: string): string => `${path}#${name}`

export class MeshReader {
  private readonly root: string
  private readonly modules = new Map<string, Module | null>()
  private readonly builders = new Map<string, MeshKind>()
  private readonly moduleBuilders = new Map<string, MeshKind>()
  private readonly dispatch = new Set<string>()
  private readonly callsite = new Map<string, (text: string) => MeshKind>()
  // after read(): each reached name and the declaration that reached it
  lastVia = new Map<string, string>()

  // the chain of declarations from the experiment to a reached name
  chain(name: string): string[] {
    const out = [name]
    let at = name

    while (this.lastVia.has(at) && out.length < 30) {
      at = this.lastVia.get(at)!
      out.push(at)

      if (at === 'experiment') {
        break
      }
    }

    return out.reverse()
  }

  constructor(root: string) {
    this.root = root

    for (const [module, name, kind] of NAMED_BUILDERS) {
      this.builders.set(key(this.file(module), name), kind)
    }

    for (const [module, kind] of MODULE_BUILDERS) {
      this.moduleBuilders.set(this.file(module), kind)
    }

    for (const [module, name] of DISPATCH) {
      this.dispatch.add(key(this.file(module), name))
    }

    for (const [module, name, decide] of CALLSITE) {
      this.callsite.set(key(this.file(module), name), decide)
    }
  }

  // every builder module must exist, so a renamed file fails loudly instead of silently labeling nothing
  missingBuilders(): string[] {
    const missing: string[] = []
    const all = [
      ...NAMED_BUILDERS.map(([m, n]) => [m, n] as const),
      ...DISPATCH,
      ...CALLSITE.map(([m, n]) => [m, n] as const),
    ]

    for (const [module, name] of all) {
      const parsed = this.module(this.file(module))

      if (parsed === null || !parsed.declarations.has(name)) {
        missing.push(`${module}#${name}`)
      }
    }

    for (const [module] of MODULE_BUILDERS) {
      if (!existsSync(this.file(module))) {
        missing.push(module)
      }
    }

    return missing
  }

  private file(module: string): string {
    return resolve(this.root, `${module}.ts`)
  }

  private resolveImport(from: string, specifier: string): string | null {
    let base: string

    if (specifier.startsWith('@/')) {
      base = resolve(this.root, specifier.slice(2))
    } else if (specifier.startsWith('.')) {
      base = resolve(dirname(from), specifier)
    } else {
      return null
    }

    for (const candidate of [`${base}.ts`, join(base, 'index.ts'), base]) {
      if (candidate.endsWith('.ts') && existsSync(candidate)) {
        return candidate
      }
    }

    return null
  }

  private module(path: string): Module | null {
    if (this.modules.has(path)) {
      return this.modules.get(path)!
    }

    if (!existsSync(path)) {
      this.modules.set(path, null)

      return null
    }

    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    )
    const declarations = new Map<string, Declaration>()
    const imports = new Map<string, [string, string]>()
    const namespaces = new Map<string, string>()
    const reexports = new Map<string, [string, string]>()
    const starExports: string[] = []
    const declare = (name: string, node: ts.Node): void => {
      const found = declarations.get(name)

      if (found) {
        found.nodes.push(node)
      } else {
        declarations.set(name, { nodes: [node] })
      }
    }

    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement)) {
        const target = this.resolveImport(
          path,
          (statement.moduleSpecifier as ts.StringLiteral).text,
        )
        const clause = statement.importClause

        if (target === null || clause === undefined) {
          continue
        }

        if (clause.name) {
          imports.set(clause.name.text, [target, 'default'])
        }

        const bindings = clause.namedBindings

        if (bindings && ts.isNamespaceImport(bindings)) {
          namespaces.set(bindings.name.text, target)
        } else if (bindings) {
          for (const element of bindings.elements) {
            imports.set(element.name.text, [
              target,
              (element.propertyName ?? element.name).text,
            ])
          }
        }
      } else if (ts.isExportDeclaration(statement)) {
        if (statement.moduleSpecifier === undefined) {
          continue
        }

        const target = this.resolveImport(
          path,
          (statement.moduleSpecifier as ts.StringLiteral).text,
        )

        if (target === null) {
          continue
        }

        if (statement.exportClause === undefined) {
          starExports.push(target)
        } else if (ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            reexports.set(element.name.text, [
              target,
              (element.propertyName ?? element.name).text,
            ])
          }
        }
      } else if (
        ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)
      ) {
        if (statement.name) {
          declare(statement.name.text, statement)
        }
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          for (const name of bindingNames(declaration.name)) {
            declare(name, declaration)
          }
        }
      }
    }

    const parsed: Module = {
      path,
      declarations,
      imports,
      namespaces,
      reexports,
      starExports,
      source,
    }

    this.modules.set(path, parsed)

    return parsed
  }

  // the module and name that finally define an exported name, through re-exports
  private definition(
    path: string,
    name: string,
    depth = 0,
  ): [string, string] | null {
    const parsed = this.module(path)

    if (parsed === null || depth > 20) {
      return null
    }

    if (parsed.declarations.has(name)) {
      return [path, name]
    }

    const re = parsed.reexports.get(name)

    if (re) {
      return this.definition(re[0], re[1], depth + 1)
    }

    const imported = parsed.imports.get(name)

    if (imported) {
      return this.definition(imported[0], imported[1], depth + 1)
    }

    for (const star of parsed.starExports) {
      const found = this.definition(star, name, depth + 1)

      if (found) {
        return found
      }
    }

    return null
  }

  read(experiment: string): MeshReach {
    const path = resolve(this.root, experiment)
    const parsed = this.module(path)
    const meshes = new Set<MeshKind>()
    const evidence = new Set<string>()
    let workingRule = false

    if (parsed === null) {
      return {
        meshes: [],
        evidence: ['missing file'],
        workingRule: false,
        boxStore: false,
        runsRule: false,
      }
    }

    const experimentText = codeOnly(parsed.source.text)
    const seen = new Set<string>()
    const queue: [Module, ts.Node, string][] = parsed.source.statements
      .filter(s => !ts.isImportDeclaration(s))
      .map(s => [parsed, s, 'experiment'])
    // the declaration that first reached each one, so a label can be traced back to the call chain that made it
    const via = new Map<string, string>()
    let current = 'experiment'

    this.lastVia = via
    const workingRuleFile = this.file('code/rule/coined-locked-knit')
    const boxStoreId = key(this.file('code/measure/dense-hub'), 'storeOfKind')
    let boxStore = false
    const ruleDir = resolve(this.root, 'code/rule') + '/'
    let runsRule = false

    const visitName = (from: Module, name: string): void => {
      let target: [string, string] | null = null

      if (from.declarations.has(name)) {
        target = [from.path, name]
      } else {
        const imported = from.imports.get(name)

        if (imported) {
          target = this.definition(imported[0], imported[1])
        }
      }

      if (target === null) {
        return
      }

      enqueue(target[0], target[1])
    }

    const enqueue = (path: string, name: string): void => {
      const id = key(path, name)

      if (seen.has(id)) {
        return
      }

      seen.add(id)
      via.set(name, current)

      if (path === workingRuleFile) {
        workingRule = true
      }

      if (path.startsWith(ruleDir)) {
        runsRule = true
      }

      // the box's working vacuum store (E-RLT-0105) is laid out from box coordinates, but a run may lay it on any
      // mesh as a stand-in store (E-GMT-0042 Q4), so it marks the vacuum, never the mesh, and is not entered
      if (id === boxStoreId) {
        boxStore = true

        return
      }

      const named = this.builders.get(id)

      if (named) {
        meshes.add(named)
        evidence.add(`${named}:${name}`)

        return
      }

      const whole = this.moduleBuilders.get(path)

      if (whole) {
        meshes.add(whole)
        evidence.add(`${whole}:${relative(this.root, path).replace(/\.ts$/, '')}`)

        return
      }

      // dispatch and symbolic builders are judged at their call sites, never entered
      if (this.dispatch.has(id) || this.callsite.has(id)) {
        return
      }

      const module = this.module(path)
      const declaration = module?.declarations.get(name)

      if (module && declaration) {
        for (const node of declaration.nodes) {
          queue.push([module, node, name])

          // a declaration that hand-rolls a D4 box (the D4 roots and a periodic side) builds the box itself
          const body = codeOnly(node.getText(module.source))

          if (INLINE_ROOTS.test(body) && INLINE_WRAP.test(body)) {
            meshes.add('d4-box')
            evidence.add(`d4-box:inline ${name}`)
          } else if (INLINE_ROOTS.test(body) && INLINE_BLOCH.test(body)) {
            meshes.add('d4-box')
            evidence.add(`d4-box:bloch ${name}`)
          }
        }
      }
    }

    const callTarget = (
      from: Module,
      callee: ts.Expression,
    ): [string, string] | null => {
      if (ts.isIdentifier(callee)) {
        if (from.declarations.has(callee.text)) {
          return [from.path, callee.text]
        }

        const imported = from.imports.get(callee.text)

        return imported ? this.definition(imported[0], imported[1]) : null
      }

      if (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression)
      ) {
        const namespace = from.namespaces.get(callee.expression.text)

        return namespace
          ? this.definition(namespace, callee.name.text)
          : null
      }

      return null
    }

    while (queue.length > 0) {
      const [module, root, owner] = queue.pop()!

      current = owner

      const walk = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
          const target = callTarget(module, node.expression)

          if (target) {
            const id = key(target[0], target[1])
            const argument = node.arguments
              .map(a => a.getText(module.source))
              .join(' ')

            // a dispatcher builds the box unless its argument hands it a mesh (and never names a side or roles)
            if (
              this.dispatch.has(id) &&
              (/\b(side|roles)\b/.test(argument) || !/\bmesh\b/.test(argument))
            ) {
              meshes.add('d4-box')
              evidence.add(`d4-box:${target[1]}(side)`)
            }

            const decide = this.callsite.get(id)

            if (decide) {
              const kind = decide(
                `${argument}\n${root.getText(module.source)}\n${experimentText}`,
              )

              meshes.add(kind)
              evidence.add(`${kind}:${target[1]}`)
            }
          }
        }

        if (
          ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression)
        ) {
          const namespace = module.namespaces.get(node.expression.text)

          if (namespace) {
            const found = this.definition(namespace, node.name.text)

            if (found) {
              enqueue(found[0], found[1])
            }
          }
        }

        if (ts.isIdentifier(node)) {
          // a property name in `a.b` or `{ b: ... }` is not a reference to a declaration named b
          const parent = node.parent
          const isMember =
            parent !== undefined &&
            ((ts.isPropertyAccessExpression(parent) && parent.name === node) ||
              (ts.isPropertyAssignment(parent) && parent.name === node) ||
              (ts.isPropertySignature(parent) && parent.name === node))

          if (!isMember) {
            visitName(module, node.text)
          }
        }

        ts.forEachChild(node, walk)
      }

      walk(root)
    }

    if (INLINE_ROOTS.test(experimentText) && INLINE_WRAP.test(experimentText)) {
      meshes.add('d4-box')
      evidence.add('d4-box:inline experiment')
    }

    if (meshes.size === 0) {
      meshes.add('none')
    }

    return {
      meshes: MESH_KINDS.filter(kind => meshes.has(kind)),
      evidence: [...evidence].sort(),
      workingRule,
      boxStore,
      runsRule,
    }
  }
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) {
    return [name.text]
  }

  return name.elements.flatMap(element =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
  )
}

// strip comments and string literals so a mention in prose does not count as code
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
}

// every .ts file under a directory, for callers that want to scan
export function walkFiles(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)

    if (statSync(path).isDirectory()) {
      walkFiles(path, found)
    } else if (name.endsWith('.ts')) {
      found.push(path)
    }
  }

  return found
}
