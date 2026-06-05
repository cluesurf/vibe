// vibe-sim: a discrete-spacetime / Vibe Theory testbed.
// Public API barrel. See note/research/vibe/research/testbed/ for the design.

// core
export * from './core/rng'
export * from './core/bitset'
export * from './core/embedding'
export * from './core/graph'
export * from './core/poset'
export * from './core/substrate'
export * from './core/gauge-field'

// linalg
export * from './linalg/complex'
export * from './linalg/dense'
export * from './linalg/sparse'
export * from './linalg/eig-jacobi'
export * from './linalg/eig-lanczos'

// tone
export * from './tone/alphabet'
export * from './tone/configuration'

// substrate generators
export * from './substrate/sprinkle-minkowski'
export * from './substrate/sprinkle-curved'
export * from './substrate/lattice'
export * from './substrate/tiling-pq'
export * from './substrate/hyperbolic-graph'
export * from './substrate/grow-csg'
export * from './substrate/triangulated-surface'

// rules
export * from './rule/rule'
export * from './rule/synchronous'
export * from './rule/asynchronous'
export * from './rule/reversible'
export * from './rule/rewrite'
export * from './rule/gauge'

// operators
export * from './operator/laplacian'
export * from './operator/dirac'
export * from './operator/evolution'
export * from './operator/gauge-dirac'

// measures
export * from './measure/dimension'
export * from './measure/order-stats'
export * from './measure/distance'
export * from './measure/curvature'
export * from './measure/manifoldlike'
export * from './measure/lorentz'
export * from './measure/navigation'
export * from './measure/bell'
export * from './measure/locality'
export * from './measure/integration'
export * from './measure/wilson-loop'
export * from './measure/aharonov-bohm'

// dynamics and search
export * from './dynamics/action'
export * from './dynamics/mcmc'
export * from './dynamics/coarsegrain'
export * from './dynamics/wilson'

// experiment infrastructure
export * from './experiment/runner'
export * from './experiment/report'
