// The catalog of regular hyperbolic tessellations, the full enumerated set from Klitzing's reference
// (bendwavy.org/klitzing/dimensions/hyperbolic.htm) and the polytope wiki, organized for the substrate
// search. The regular hyperbolic tessellations are a FINITE, fully-enumerated set up to 4D compact and 5D
// paracompact (regulars of any class stop at 5D). 2D has infinitely many, so the named sample is listed.
//
// Each entry carries the ground-truth metadata (name, dimension, class, cells, vertex figure, a note). The
// MEASURED properties (rank, growth ratio, crystallographic, spinor hook, built cell count) are computed by
// code/measure/tessellation-battery from the Schläfli symbol, so this file is data, not measurement.
//
// `schlafli` is the integer Schläfli symbol our Coxeter builder constructs. Star (fractional Schläfli) and
// apeirogonal (infinity) regulars are cataloged with `buildable: false` and an empty `schlafli`.

export type TessellationClass =
  | 'compact'
  | 'paracompact'
  | 'noncompact'
  | 'hypercompact'

export interface Tessellation {
  readonly symbol: string // display form, e.g. '{5,3,4}'
  readonly schlafli: number[] // integer Schläfli, empty for star/apeirogonal (not buildable)
  readonly name: string
  readonly dimension: number // the dimension of the hyperbolic space it tiles
  readonly tessellationClass: TessellationClass
  readonly convex: boolean // false for the star regulars
  readonly cells: string // the tile type
  readonly vertexFigure: string
  readonly note: string
  readonly buildable: boolean // integer Schläfli, the Coxeter builder constructs it
}

const compact = (
  e: Omit<
    Tessellation,
    'tessellationClass' | 'convex' | 'buildable'
  > & { convex?: boolean },
): Tessellation => ({
  tessellationClass: 'compact',
  convex: e.convex ?? true,
  buildable: e.schlafli.length > 0,
  ...e,
})

const para = (
  e: Omit<
    Tessellation,
    'tessellationClass' | 'convex' | 'buildable'
  > & { convex?: boolean },
): Tessellation => ({
  tessellationClass: 'paracompact',
  convex: e.convex ?? true,
  buildable: e.schlafli.length > 0,
  ...e,
})

const noncompact = (
  e: Omit<
    Tessellation,
    'tessellationClass' | 'convex' | 'buildable'
  > & { convex?: boolean },
): Tessellation => ({
  tessellationClass: 'noncompact',
  convex: e.convex ?? true,
  buildable: e.schlafli.length > 0,
  ...e,
})

export const TESSELLATIONS: Tessellation[] = [
  // ---- 2D, the testbed plane, infinitely many compact regulars, the named sample ----
  compact({
    symbol: '{7,3}',
    schlafli: [7, 3],
    name: 'Heptagonal tiling',
    dimension: 2,
    cells: 'heptagons',
    vertexFigure: 'triangle',
    note: 'the cover image, the cheapest holography testbed',
  }),
  compact({
    symbol: '{3,7}',
    schlafli: [3, 7],
    name: 'Order-7 triangular tiling',
    dimension: 2,
    cells: 'triangles',
    vertexFigure: 'heptagon',
    note: 'dual of {7,3}',
  }),
  compact({
    symbol: '{8,3}',
    schlafli: [8, 3],
    name: 'Octagonal tiling',
    dimension: 2,
    cells: 'octagons',
    vertexFigure: 'triangle',
    note: 'more curved than {7,3}',
  }),
  compact({
    symbol: '{3,8}',
    schlafli: [3, 8],
    name: 'Order-8 triangular tiling',
    dimension: 2,
    cells: 'triangles',
    vertexFigure: 'octagon',
    note: 'dual of {8,3}',
  }),
  compact({
    symbol: '{5,4}',
    schlafli: [5, 4],
    name: 'Order-4 pentagonal tiling',
    dimension: 2,
    cells: 'pentagons',
    vertexFigure: 'square',
    note: 'non-crystallographic (5-fold)',
  }),
  compact({
    symbol: '{4,5}',
    schlafli: [4, 5],
    name: 'Order-5 square tiling',
    dimension: 2,
    cells: 'squares',
    vertexFigure: 'pentagon',
    note: 'dual of {5,4}',
  }),
  compact({
    symbol: '{6,4}',
    schlafli: [6, 4],
    name: 'Order-4 hexagonal tiling',
    dimension: 2,
    cells: 'hexagons',
    vertexFigure: 'square',
    note: 'crystallographic (4- and 6-fold)',
  }),
  compact({
    symbol: '{4,6}',
    schlafli: [4, 6],
    name: 'Order-6 square tiling',
    dimension: 2,
    cells: 'squares',
    vertexFigure: 'hexagon',
    note: 'crystallographic',
  }),
  compact({
    symbol: '{5,5}',
    schlafli: [5, 5],
    name: 'Order-5 pentagonal tiling',
    dimension: 2,
    cells: 'pentagons',
    vertexFigure: 'pentagon',
    note: 'self-dual, non-crystallographic',
  }),
  compact({
    symbol: '{6,6}',
    schlafli: [6, 6],
    name: 'Order-6 hexagonal tiling',
    dimension: 2,
    cells: 'hexagons',
    vertexFigure: 'hexagon',
    note: 'self-dual, crystallographic',
  }),
  compact({
    symbol: '{7/2,7}',
    schlafli: [],
    name: 'Stellated heptagonal tiling',
    dimension: 2,
    convex: false,
    cells: 'heptagrams',
    vertexFigure: 'heptagon',
    note: 'a non-convex star regular (not buildable here)',
  }),
  para({
    symbol: '{inf,3}',
    schlafli: [],
    name: 'Apeirogonal tiling',
    dimension: 2,
    cells: 'apeirogons',
    vertexFigure: 'triangle',
    note: 'paracompact, ideal apeirogon tiles (not buildable here)',
  }),

  // ---- 3D, the home dimension, 4 compact regulars (the prime substrates) ----
  compact({
    symbol: '{5,3,4}',
    schlafli: [5, 3, 4],
    name: 'Order-4 dodecahedral (doehon)',
    dimension: 3,
    cells: 'dodecahedra',
    vertexFigure: 'octahedron',
    note: 'THE VIBE PICK, 12-direction bulk-ternary substrate',
  }),
  compact({
    symbol: '{4,3,5}',
    schlafli: [4, 3, 5],
    name: 'Order-5 cubic (pechon)',
    dimension: 3,
    cells: 'cubes',
    vertexFigure: 'icosahedron',
    note: 'dual of {5,3,4}, the substrate-comparison candidate',
  }),
  compact({
    symbol: '{3,5,3}',
    schlafli: [3, 5, 3],
    name: 'Icosahedral (ikhon)',
    dimension: 3,
    cells: 'icosahedra',
    vertexFigure: 'dodecahedron',
    note: 'self-dual, non-crystallographic',
  }),
  compact({
    symbol: '{5,3,5}',
    schlafli: [5, 3, 5],
    name: 'Order-5 dodecahedral (pedhon)',
    dimension: 3,
    cells: 'dodecahedra',
    vertexFigure: 'icosahedron',
    note: 'self-dual, the most curved 3D compact',
  }),
  // 3D paracompact (11), Euclidean tiles
  para({
    symbol: '{3,3,6}',
    schlafli: [3, 3, 6],
    name: 'Tetrahedral honeycomb',
    dimension: 3,
    cells: 'tetrahedra',
    vertexFigure: 'triangular tiling',
    note: 'ideal triangular-tiling vertex figure',
  }),
  para({
    symbol: '{6,3,3}',
    schlafli: [6, 3, 3],
    name: 'Hexagonal tiling honeycomb',
    dimension: 3,
    cells: 'hexagonal tilings',
    vertexFigure: 'tetrahedron',
    note: 'dual of {3,3,6}',
  }),
  para({
    symbol: '{3,4,4}',
    schlafli: [3, 4, 4],
    name: 'Octahedral honeycomb',
    dimension: 3,
    cells: 'octahedra',
    vertexFigure: 'square tiling',
    note: 'crystallographic',
  }),
  para({
    symbol: '{4,4,3}',
    schlafli: [4, 4, 3],
    name: 'Square tiling honeycomb',
    dimension: 3,
    cells: 'square tilings',
    vertexFigure: 'cube',
    note: 'crystallographic, dual of {3,4,4}',
  }),
  para({
    symbol: '{3,6,3}',
    schlafli: [3, 6, 3],
    name: 'Triangular tiling honeycomb',
    dimension: 3,
    cells: 'triangular tilings',
    vertexFigure: 'triangular tiling',
    note: 'self-dual, crystallographic',
  }),
  para({
    symbol: '{4,3,6}',
    schlafli: [4, 3, 6],
    name: 'Order-6 cubic honeycomb',
    dimension: 3,
    cells: 'cubes',
    vertexFigure: 'triangular tiling',
    note: 'crystallographic',
  }),
  para({
    symbol: '{6,3,4}',
    schlafli: [6, 3, 4],
    name: 'Order-4 hexagonal tiling honeycomb',
    dimension: 3,
    cells: 'hexagonal tilings',
    vertexFigure: 'octahedron',
    note: 'crystallographic, dual of {4,3,6}',
  }),
  para({
    symbol: '{5,3,6}',
    schlafli: [5, 3, 6],
    name: 'Order-6 dodecahedral honeycomb',
    dimension: 3,
    cells: 'dodecahedra',
    vertexFigure: 'triangular tiling',
    note: 'non-crystallographic',
  }),
  para({
    symbol: '{6,3,5}',
    schlafli: [6, 3, 5],
    name: 'Order-5 hexagonal tiling honeycomb',
    dimension: 3,
    cells: 'hexagonal tilings',
    vertexFigure: 'icosahedron',
    note: 'dual of {5,3,6}',
  }),
  para({
    symbol: '{4,4,4}',
    schlafli: [4, 4, 4],
    name: 'Order-4 square tiling honeycomb',
    dimension: 3,
    cells: 'square tilings',
    vertexFigure: 'square tiling',
    note: 'self-dual, crystallographic',
  }),
  para({
    symbol: '{6,3,6}',
    schlafli: [6, 3, 6],
    name: 'Order-6 hexagonal tiling honeycomb',
    dimension: 3,
    cells: 'hexagonal tilings',
    vertexFigure: 'triangular tiling',
    note: 'self-dual, crystallographic',
  }),
  // 3D noncompact (first members of infinite families)
  noncompact({
    symbol: '{3,3,7}',
    schlafli: [3, 3, 7],
    name: 'Order-7 tetrahedral honeycomb',
    dimension: 3,
    cells: 'tetrahedra',
    vertexFigure: '{3,7} hyperbolic tiling',
    note: 'hyperbolic vertex figure, first of an infinite family',
  }),
  noncompact({
    symbol: '{7,3,3}',
    schlafli: [7, 3, 3],
    name: 'Heptagonal tiling honeycomb',
    dimension: 3,
    cells: '{7,3} hyperbolic tilings',
    vertexFigure: 'tetrahedron',
    note: 'dual, hyperbolic cells',
  }),
  noncompact({
    symbol: '{3,7,3}',
    schlafli: [3, 7, 3],
    name: 'Order-7 triangular tiling honeycomb',
    dimension: 3,
    cells: 'triangular tilings',
    vertexFigure: 'triangular tiling',
    note: 'self-dual, hyperbolic',
  }),

  // ---- 4D, the last compact regular dimension, 5 convex regulars ----
  compact({
    symbol: '{3,3,3,5}',
    schlafli: [3, 3, 3, 5],
    name: 'Pentachoric tetracomb (pente)',
    dimension: 4,
    cells: '5-cells',
    vertexFigure: '600-cell',
    note: 'simplex-tiled',
  }),
  compact({
    symbol: '{5,3,3,3}',
    schlafli: [5, 3, 3, 3],
    name: 'Hecatonicosachoric tetracomb (hitte)',
    dimension: 4,
    cells: '120-cells',
    vertexFigure: '5-cell',
    note: '120-cell-tiled, dual of pente',
  }),
  compact({
    symbol: '{4,3,3,5}',
    schlafli: [4, 3, 3, 5],
    name: 'Order-5 tesseractic tetracomb (pitest)',
    dimension: 4,
    cells: 'tesseracts',
    vertexFigure: '600-cell',
    note: 'cubic family in 4D',
  }),
  compact({
    symbol: '{5,3,3,4}',
    schlafli: [5, 3, 3, 4],
    name: 'Order-4 hecatonicosachoric (shitte)',
    dimension: 4,
    cells: '120-cells',
    vertexFigure: '16-cell',
    note: 'richest 4D compact, dual of pitest',
  }),
  compact({
    symbol: '{5,3,3,5}',
    schlafli: [5, 3, 3, 5],
    name: 'Order-5 hecatonicosachoric (phitte)',
    dimension: 4,
    cells: '120-cells',
    vertexFigure: '600-cell',
    note: 'self-dual, the richest 4D compact regular',
  }),
  compact({
    symbol: '{3,3,5,5/2}',
    schlafli: [],
    name: 'Faceted pentachoric tetracomb (fipte)',
    dimension: 4,
    convex: false,
    cells: 'star',
    vertexFigure: 'star',
    note: 'a 4D star regular (not buildable here)',
  }),
  // 4D paracompact (3), the 24-cell / D4 hook appears here
  para({
    symbol: '{4,3,4,3}',
    schlafli: [4, 3, 4, 3],
    name: 'Cubic honeycomb tetracomb',
    dimension: 4,
    cells: 'cubic honeycombs {4,3,4}',
    vertexFigure: '24-cell',
    note: 'dual of {3,4,3,4}',
  }),
  para({
    symbol: '{3,4,3,4}',
    schlafli: [3, 4, 3, 4],
    name: 'Order-4 icositetrachoric tetracomb',
    dimension: 4,
    cells: '24-cells',
    vertexFigure: 'cubic honeycomb',
    note: 'THE D4 AND 24-CELL ONE, the spinor coin substrate',
  }),
  noncompact({
    symbol: '{4,4,3,3}',
    schlafli: [4, 4, 3, 3],
    name: 'Square tiling honeycomb tetracomb',
    dimension: 4,
    cells: 'square tilings {4,4}',
    vertexFigure: 'tesseract',
    note: 'noncompact, infinite square-tiling tiles',
  }),
  noncompact({
    symbol: '{4,4,4,4}',
    schlafli: [4, 4, 4, 4],
    name: 'Order-4-4 square tiling tetracomb',
    dimension: 4,
    cells: 'square tilings',
    vertexFigure: 'square tiling',
    note: 'self-dual, all-4 crystallographic, noncompact',
  }),

  // ---- 5D, the last regular dimension anywhere, 5 paracompact pentacombs ----
  para({
    symbol: '{4,3,3,4,3}',
    schlafli: [4, 3, 3, 4, 3],
    name: 'Tesseractic tetracomb pentacomb',
    dimension: 5,
    cells: 'cubes',
    vertexFigure: 'tesseractic {4,3,3,4}',
    note: 'dual of {3,4,3,3,4}',
  }),
  para({
    symbol: '{3,4,3,3,4}',
    schlafli: [3, 4, 3, 3, 4],
    name: 'Order-4 icositetrachoric pentacomb',
    dimension: 5,
    cells: 'octahedra',
    vertexFigure: 'icositetrachoric {3,4,3,3}',
    note: 'THE PENTACOMB, 24-cell substructure, spin AND curvature, the trade resolved',
  }),
  para({
    symbol: '{3,3,4,3,3}',
    schlafli: [3, 3, 4, 3, 3],
    name: 'Hexadecachoric tetracomb pentacomb',
    dimension: 5,
    cells: 'tetrahedra',
    vertexFigure: 'hexadecachoric {3,3,4,3}',
    note: 'self-dual',
  }),
  para({
    symbol: '{3,4,3,3,3}',
    schlafli: [3, 4, 3, 3, 3],
    name: 'Icositetrachoric tetracomb pentacomb',
    dimension: 5,
    cells: 'octahedra',
    vertexFigure: 'icositetrachoric {3,4,3,3}',
    note: '24-cell substructure, the other spinor pentacomb, dual of {3,3,3,4,3}',
  }),
  para({
    symbol: '{3,3,3,4,3}',
    schlafli: [3, 3, 3, 4, 3],
    name: '5-orthoplex pentacomb',
    dimension: 5,
    cells: 'tetrahedra',
    vertexFigure: '5-orthoplex {3,3,3,4}',
    note: 'dual of {3,4,3,3,3}',
  }),
]
