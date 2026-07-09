# code/dynamics

The time-evolution, sampling, and search layer, above the base rule and below coarse-graining in the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). Where `code/rule` is the one committed reversible law, this folder is everything else you can run on a substrate: Monte Carlo samplers over causal orders, quantum and classical walks, reversible wave fields, lattice gauge sweeps, gravity and cosmology integrators, order-parameter field relaxations, conserving-charge sweeps with tunable biases, quantum measurement and decoherence models, and the genesis and morphogenesis studies. About sixty modules, each a self-contained runnable with explicit RNG seeding, never implicit randomness. This is the widest layer, so it is organized by theme below rather than by single entry point.

## Sampling and Monte Carlo

The causal-set path integral and its samplers.

| file | key exports | one-line |
|:--- |:--- |:--- |
| `action.ts` | `benincasaDowkerAction`, `smearedBenincasaDowker`, `dimensionTargetAction`, `Action` | the Benincasa-Dowker discrete action on a causal set |
| `mcmc.ts` | `sampleCausalSets`, `transitiveClosure` | Metropolis MCMC over causal orders with single-pair moves |
| `uniform-sampler.ts` | `sampleUniform`, `makeState`, `toggleKeepsValid`, `height`, `smearedAction` | uniform-measure sampling with transitivity-preserving toggles |
| `parallel-tempering.ts` | `parallelTempering` | replica-exchange across a temperature ladder to escape metastable basins |
| `wang-landau.ts` | `wangLandauHeight`, `WangLandauResult` | Wang-Landau density of states over the height spectrum |
| `exact-enumeration.ts` | `exactCausalSetAverages` | exact Boltzmann averages by enumerating all transitive relations |

## Quantum and classical walks

| file | key exports | one-line |
|:--- |:--- |:--- |
| `quantum-walk.ts` | `coinedWalkMSD`, `continuousQuantumWalkMsd`, `diracQuantumWalk`, `twoParticleQuantumWalk`, `diracTwoModeSurvival` | coined, continuous, and Dirac quantum walks, return probability and two-particle identity |
| `random-walk.ts` | `classicalWalkMSD`, `graphWalkMsdExponent`, `randomWalkEndpoint`, `persistentWalkMeanDisplacement` | classical diffusion, the MSD exponent on any graph |
| `coined-walk-distribution.ts` | `coinedWalkQuantumDistribution`, `coinedWalkClassicalDistribution` | the position distribution, quantum interference versus classical |
| `walk-dispersion.ts` | `omegaFromDynamics`, `ringSpectrumWithFlux` | the Dirac dispersion from autocorrelation, ring spectrum with flux |
| `dirac-scattering.ts` | `diracScatter`, `diracTunnel`, `walkTunnelKappa`, `continuumTunnelKappa` | unitary scattering and tunnelling through a mass barrier |
| `peierls-wavepacket.ts` | `peierlsWavepacketDrift` | transverse Lorentz drift of a packet in the Landau gauge |
| `swerve-walk.ts` | `swerveWalk` | a discrete rapidity walk on a sprinkled causal set |

## Waves and reversible fields

| file | key exports | one-line |
|:--- |:--- |:--- |
| `wave-field.ts` | `makeWaveField`, `stepWaveField`, `doubleWellAccel`, `WaveField` | the reversible discrete Klein-Gordon and sine-Gordon wave |
| `leapfrog-wave.ts` | `leapfrogWaveStep`, `evolveLeapfrogWave`, `blockAverage`, `leapfrogWaveCommutingError` | the leapfrog unitary wave and its renormalization commuting error |
| `reversible-wave.ts` | `reversibleWaveStep`, `reversibleWaveStepNonlinear` | the second-order mod-q wave update in place |
| `phase-field.ts` | `phaseWaveStep`, `phaseRelaxStep`, `windingKinkWithLump`, `gradientStructure` | the XY / sine-Gordon phase field, wave and dissipative |
| `ternary-field.ts` | `makeTernaryField`, `stepTernaryField`, `linearTernaryRule` | the reversible mod-3 cellular automaton |

## Renormalization and coarse-graining

| file | key exports | one-line |
|:--- |:--- |:--- |
| `renormalization-group.ts` | `oneLoopInverseCoupling`, `couplingMeetingTime`, `gutScaleAndCoupling`, `predictWeinbergAngle`, `protonLifetimeYears` | one-loop running couplings, unification, the Weinberg angle and proton lifetime |
| `renormalization-blocks.ts` | `geometricBlocks`, `domainBlocks`, `csrVoronoiBlocks`, `coherentFills` | the block constructions the coarse-graining tower uses |
| `coarsegrain.ts` | `decimate` | random subsampling (decimation) of a causal set |

## Gauge and lattice theories

| file | key exports | one-line |
|:--- |:--- |:--- |
| `su2-lattice.ts` | `makeSu2Lattice`, `metropolisSweep`, `averagePlaquette`, `wilsonLoop`, `creutzRatio` | SU(2) lattice gauge theory, the string tension from Wilson loops |
| `wilson.ts` | `plaquettesOf`, `wilsonAction`, `heatBathSweep` | the U(1) Wilson plaquette action and heat-bath sweep on a graph |
| `wilson-grid.ts` | `gridPlaquettes`, `gridWilsonAction`, `gridMaxwellAction` | plaquettes and the Wilson / Maxwell action on an L^3 lattice |
| `schwinger-coupled.ts` | `runCoupledSchwinger`, `CoupledSchwingerInput`, `CoupledSchwingerResult` | the coupled fermion-plus-gauge Schwinger-model evolution |

## Gravity and relativity

| file | key exports | one-line |
|:--- |:--- |:--- |
| `gravity-field.ts` | `bulkMass`, `relaxPotential`, `gravityMoves`, `vacuumDensity` | dense cells as mass, a discrete Poisson solve, cells falling down the gradient |
| `free-fall.ts` | `freeFallStep` | cells fall to the lowest-potential neighbour, the equivalence principle |
| `schwarzschild-photon.ts` | `schwarzschildPhotonDeflection`, `photonSphereShadowRadius`, `measuredShadowRadius` | photon lensing and the black-hole shadow radius |
| `static-metric-photon.ts` | `staticMetricPhotonDeflection`, `spatialMetricBootstrap` | deflection on a static (A, B) metric |
| `central-force-orbit.ts` | `integrateCentralForceOrbit`, `centralForceAcceleration` | RK4 orbits, the Bertrand and Ehrenfest closure tests |
| `friedmann.ts` | `integrateFriedmann`, `friedmannStep`, `decelerationParameter`, `FluidComponent` | the FLRW cosmology integrator |
| `optical-ray.ts` | `refractiveDeflection` | light bending via a time-dilation effective index |
| `graded-index-ray.ts` | `traceGradedIndexRay`, `rayDeflection`, `softenedMassIndexField` | eikonal ray tracing through a graded index |

## Order-parameter fields

| file | key exports | one-line |
|:--- |:--- |:--- |
| `ginzburg-landau.ts` | `relaxRingField`, `ringFieldWithWinding`, `ringDefectPair`, `ringFieldEnergy` | complex-field gradient flow, defect annihilation |
| `skyrmion-field.ts` | `relaxSpins`, `precessSpins`, `skyrmionDegree`, `skyrmionRadius`, `makeSkyrmionField` | Dzyaloshinskii-Moriya spins, the topological skyrmion charge |
| `higgs-mechanism.ts` | `mexicanHatVacuum`, `higgsBosonMassSquared`, `gaugeBosonMass` | the Mexican-hat vacuum and the mass from symmetry breaking |
| `inflaton.ts` | `inflatonStep`, `inflatonHubble` | the single-field inflaton slow roll |
| `shell-model.ts` | `goyShellSpectrum`, `spectrumSlope` | the GOY turbulence cascade, the Kolmogorov exponent |

## Conserving-charge sweeps

The tunable non-reversible sweeps the selves and transport studies use. Each moves charge on an edge list or graph, with knobs for creation, hopping, and bias.

| file | key exports | one-line |
|:--- |:--- |:--- |
| `conserving-sweep.ts` | `conservingEdgeSweep`, `conservingEdgeSweepTunable`, `conservingRingSweep`, `conservingHopSweep`, `conservingEdgeSweepSteered`, `conservingEdgeSweepHashed` | the baseline annihilate-hop-create matching sweeps, tunable and steerable |
| `cohesive-sweep.ts` | `cohesiveEdgeSweep`, `agreeCount` | demand-driven hopping, charges cluster with an optional escape |
| `soc-sweep.ts` | `socEdgeSweep`, `localActivity` | self-organized criticality, creation suppressed in busy regions |
| `fill-gated-sweep.ts` | `fillGatedSweep` | a per-edge fill gates local moves (polarize, share, insulate) |
| `flat-willed-drift-sweep.ts` | `flatWilledDriftSweep` | a biased hop toward a goal on a 2D grid |
| `perception-edge-beat.ts` | `perceptionEdgeBeat` | dispatch between the cohesive and plain conserving sweeps |
| `pumped-reserve-sweep.ts` | `pumpedReserveSweep` | a willpower reserve pumped toward a self centre, draining across a boundary |

## Measurement and decoherence

| file | key exports | one-line |
|:--- |:--- |:--- |
| `measurement.ts` | `pointerTrajectory`, `slabOccupancy`, `loschmidtEcho`, `bornAtPeace`, `settledSignedPointer` | pointer evolution, the Loschmidt echo, the Born-at-peace open bath |
| `zeno-holding.ts` | `zenoHoldSpread`, `zenoHoldSpreadOverSizes`, `chargeSpread` | the quantum Zeno effect, re-imposition suppresses diffusion |
| `stabilizer-check.ts` | `syndromeFirstFires` | the beat at which a charge-conservation check first fails |
| `collision-model.ts` | `freshCollisionPopulations`, `reusedCollisionPopulations` | Lindblad decay versus a memory revival from a reused environment |

## Genesis, growth, and topology

| file | key exports | one-line |
|:--- |:--- |:--- |
| `genesis.ts` | `chargeTrajectory`, `genesisProfile`, `oneBeat`, `gardenOfEdenFraction`, `attractorSignature`, `growingMeshGenesis` | charge dynamics from first distinction, the genesis diagnostic on a growing mesh |
| `morphogenesis.ts` | `morphogenesis` | the Turing activator-inhibitor, regular stripe formation |
| `nucleation.ts` | `nucleate` | the critical-nucleus threshold (abiogenesis) |
| `clock-winding.ts` | `clockWinding`, `stepClockRing`, `makeTwist`, `ClockRing` | a reversible mod-n clock field and its winding number |
| `director-relaxation.ts` | `relaxDirector` | nematic director relaxation, disclinations conserved |
| `permutation-orbit.ts` | `recurrencePeriod`, `ruleInjective` | the recurrence period and the injectivity (permutation) test of a rule |
| `replication.ts` | `replicate` | deterministic template copying with an optional single-site error |

## Search, pursuit, and baths

| file | key exports | one-line |
|:--- |:--- |:--- |
| `goal-directed-search.ts` | `solveGoalDirected`, `solveUndirected` | gap-reducing search (linear) versus aimless search (exponential) |
| `pursuit.ts` | `pursueDriftingPeak`, `PursuitResult` | plan versus track policies chasing a drifting peak |
| `bath.ts` | `absorbBoundary`, `frontierToPeace`, `isBoundaryCell` | the absorbing radiation boundary and the born-at-peace frontier |
| `oscillator-bath.ts` | `oscillatorBathTrajectory`, `twoBodyBathTrajectory`, `lateAmplitude` | a body in a well coupled to a radiative bath, two bodies binding |
| `shadow-pressure.ts` | `shadowPressureRun`, `shadowPressureD4`, `selfContainedShadowD4`, `shadowWellField1D` | the Casimir-like vacuum-radiation shadow pressure |

## Used by

- **Narrated by** [evolution-and-propagation.md](../evolution-and-propagation.md) (the leapfrog wave and the return-probability test), [lattice-gauge-engine.md](../lattice-gauge-engine.md) (the Wilson and Schwinger sweeps), and [causal-set-sampler.md](../causal-set-sampler.md) (the action, the uniform sampler, parallel tempering, Wang-Landau). Consumer guide, [api/dynamics.md](../api/dynamics.md).
- **Runs on** substrates from `code/substrate` and states from `code/tone`, diagonalizing through `code/algebra/linear` where a spectrum is needed. The conserving sweeps feed `code/coarse` (the selves work).
- **Example arenas** `test/experiment/cosmology/` and `gravity/` (Friedmann, inflaton, photon deflection, gravity field), `test/experiment/quantum/` (walks, scattering, measurement, Zeno), `test/experiment/gauge/` (SU(2), Wilson, Schwinger), `test/experiment/fluids/` (shell model, sweeps), and `test/experiment/foundations/` and `general/` (genesis, nucleation, morphogenesis, search).
