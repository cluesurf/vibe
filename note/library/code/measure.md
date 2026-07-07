# measure (read a number off a state)

A measure takes a substrate, a state, a spectrum, or a walk and returns a number. This is the readout layer, the thing an experiment reports. The observables cover geometry, relativity, quantum information, fields and gravity, the standard-model structure, holography, and statistics. Everything is finite and deterministic, so a measure is a pure function of its input. This file is the full module index (about 155 files). For a friendly, snippet-driven tour of the essentials, read `../api/measure.md`. For the flagship observables (Fisher-Rao, spectra, entropy, correlations) start with the entry points below.

Import from `@/code/measure/<file>`.

## Geometry and dimension

| module | key exports | what it returns |
| --- | --- | --- |
| `shells` | `bfsShells`, `geodesicBall`, `branchingRatio`, `geometricGrowthRatio` | breadth-first shell counts and the ball within a radius |
| `shell-growth` | `shellCountsFromGraph`, `growthRatioFromShellCounts`, `shellSeparationExponent` | shell census and growth from a graph |
| `shell-growth-ratio` | `shellGrowthRatio` | growth per step (1 flat, above 1 hyperbolic) |
| `distance` | `graphDistance`, `longestChain` | shortest-path hop count, longest causal chain |
| `dimension` | `spectralDimension`, `ballGrowthDimension`, `boxCountingDimension`, `myrheimMeyerDimension` | effective dimension from a walk, a ball, a box count, or an ordering fraction |
| `boundary-dimension` | `boundaryDimension` | dimension of the boundary shell |
| `cusp-dimension` | `cuspDimension` | dimension of the flat cusp slice |
| `curvature` | `formanRicci`, `meanCurvature`, `gromovDelta`, `shellGrowthCurvature` | discrete Ricci, mean curvature, hyperbolicity |
| `slice-curvature` | `cubicBallCount`, `treeBallCount`, `polynomialExponent`, `exponentialRate` | ball growth on a slice, polynomial versus exponential |
| `crystallographic` | `directionsAreCrystallographic` | whether directions form a crystal lattice |
| `region-diameter` | `bulkDiameter`, `cuspDiameter`, `diameterExponent` | diameter scaling of bulk and cusp |
| `manifoldlike` | `manifoldLikeness` | how manifold-like a poset is |
| `point-set` | `centroidOfCellSet`, `radiusOfGyrationOfCellSet`, `jaccardDistance`, `cellSetOverlap` | centroid, gyration, overlap of a cell set |
| `radial` | `graphBusemann`, `busemannLevels` | the radial (Busemann) depth structure |
| `bulk-geometry` | `upperHalfPlaneDistance`, `geodesicSeparation`, `triangleDeficit`, `circleHolonomy` | continuum hyperbolic geometry for validation |
| `cross-ratio` | `crossRatio`, `maxChordDistortion` | projective invariant and embedding distortion |
| `dimensional-shadow` | `transverseShadow`, `shadowCensus`, `genericProjectionShadowCount` | projection shadow classes |
| `scale-detail` | `blockMeanField`, `scaleDetailNorm` | detail lost under block coarsening |

## Relativity and dynamics

| module | key exports | what it returns |
| --- | --- | --- |
| `light-cone` | `lightConeRadii`, `streamingConeRadii`, `perturbationConeRadii` | the front radius per beat (the discrete light cone) |
| `lorentz` | `lorentzIsotropy`, `latticeAnisotropy`, `lorentzSafety` | how direction-independent the front speed is |
| `front-speed` | `directionalFrontDistances`, `rangeAnisotropy` | reach and spread per direction |
| `isotropy` | `diffusionTensorAnisotropy`, `angularAnisotropy`, `harmonicAnisotropy` | anisotropy of a walk or a front |
| `dispersion` | `relativisticDispersionFit`, `latticeDispersion`, `waveModeFrequency` | frequency versus wave number |
| `doubly-special` | `continuumDispersion`, `scanDispersionBand` | modified dispersion at high momentum |
| `group-speed` | `groupSpeed`, `groupVelocity1d`, `groupSpeedAnisotropy` | wave-packet group velocity |
| `discrete-boost` | `boostEquivarianceDefect`, `boostShell`, `rapidityMaxGap` | how well a discrete boost acts |
| `rapidity` | `linkRapidities`, `addVelocities`, `boostEnergyMomentum` | rapidity addition and boosted energy-momentum |
| `brillouin-zone` | `scanTorusZeroSet`, `directionalConeVelocities` | zero set and cone velocities on the torus |
| `localization` | `returnProbability`, `boundStateDecayExponent` | return chance (localization signal) |
| `fermion-propagation` | `kahlerDiracReturn` | fermion return amplitude under Kahler-Dirac stepping |
| `transport` | `sinkhornW1` | optimal-transport (Wasserstein) distance between fields |
| `kernel-width-transport` | `packetRmsTrace`, `transportExponent` | how a packet width grows in time |
| `wavefront` | `wavefrontProfile` | the shape of an advancing front |
| `sound-wave` | `densityWaveAlongAxis`, `stripeContrast`, `firstMinimumTime` | acoustic density wave along an axis |
| `acoustic-horizon` | `tanhHorizonSpeed`, `rayFreezeSurfaceGravity` | analogue (acoustic) horizon and surface gravity |
| `swerve-diffusion` | `swerveDiffusion` | causal-set swerve (momentum diffusion) |
| `continuity` | `coarseContinuityResidual` | how well coarse fields satisfy continuity |
| `graph-continuity` | `regionBall`, `regionCharge`, `continuityResidual` | local charge continuity on a graph |
| `momentum-continuity` | `maxMomentumResidual` | momentum-conservation residual |
| `momentum` | `totalMomentum`, `momentumDrift` | total momentum and its drift |

## Quantum and information

| module | key exports | what it returns |
| --- | --- | --- |
| `bell` | `chsh`, `chshFromSharedPast`, `chshShared`, `TSIRELSON_SHARED_PAST` | the CHSH Bell value (above 2 breaks local realism) |
| `bell-structure` | `singletChsh`, `ghzState`, `wClassState`, `horodeckiChsh` | Bell structure of singlet, GHZ, W states |
| `two-qubit` | `twoQubitCorrelationMatrix`, `horodeckiMaxChsh`, `twoQubitConcurrence` | two-qubit correlations, max CHSH, concurrence |
| `two-point` | `diracEqualTimeCorrelator` | equal-time fermion two-point function |
| `contextuality` | `peresMerminSquare` | the Peres-Mermin contextuality square |
| `leggett-garg` | `temporalCorrelator`, `leggettGarg` | the temporal (macrorealism) inequality |
| `born-rule` | `patchesFromAmplitudes`, `quadratureAdditivityResidual`, `fairSampleFrequencies` | Born-rule weight structure |
| `born-branches` | `deviantBranchNorm`, `deviantBranchCount`, `refinementShift` | branch weights under refinement |
| `entanglement` | `freeFermionCorrelationMatrix`, `regionEntanglementEntropy`, `pageAverageEntropy` | entanglement entropy of a free-fermion region |
| `walk-entanglement` | `coinedWalkIntervalEntropy` | entanglement in a coined quantum walk |
| `uncertainty` | `packetUncertaintyProduct` | the position-momentum uncertainty product |
| `exchange-statistics` | `permanent2`, `determinant2`, `propagatorColumn`, `walkStep` | boson versus fermion exchange amplitudes |
| `qca-unitarity` | `stateOrbit`, `superpositionNormAfterBeat`, `ruleInjectivity` | unitarity of a cellular rule |
| `darwinism` | `fragmentMutualInformation`, `chainCoherence` | quantum-Darwinism redundancy |
| `redundancy-code` | `recoverByMajority`, `corruptConnectedRegion` | error correction by redundancy |
| `recoverability` | `recoverabilityTrace` | information recovered after evolution |
| `shared-past` | `bulkSharedPast`, `seedSharedPast`, `backwardCone` | the common past of two events |
| `statistics` | `mean`, `pearson`, `mutualInformationBits`, `relativeL2Error` | the shared statistics kit |
| `tone-entropy` | `ternaryToneEntropyBits` | Shannon entropy of the tone field |
| `tone-correlation` | `connectedToneCorrelation`, `meanCorrelationMagnitude` | connected tone correlation |
| `connected-correlation` | `connectedCorrelationByDistance`, `correlationLengthFromDecay` | correlation length from decay |

## Fields, gravity, and matter

| module | key exports | what it returns |
| --- | --- | --- |
| `wilson-loop` | `wilsonLoopValue`, `wilsonLoopPhase`, `creutzRatioFromLoops` | gauge holonomy and the confinement signal |
| `aharonov-bohm` | `aharonovBohmPhase` | phase around enclosed flux |
| `greens-function` | `dirichletGreensFunction`, `greensFunctionExponent`, `greensDecayClass` | lattice Green's function on a region |
| `field-laplacian` | `fieldLaplacianProfile` | the Laplacian profile of a field |
| `gravity-potential` | `newtonianPotential3D`, `branePotential`, `weakFieldLightDeflection` | gravity potential and light bending |
| `gravity-exponent` | `gravityExponent` | the force-law exponent |
| `newton-falloff` | `newtonFalloffExponent` | how the potential falls off |
| `rotation-curve` | `rotationCurveFromPotential` | galaxy rotation curve from a potential |
| `shadow-gravity` | `fibonacciSphereDirections`, `isotropicShadowFraction`, `leSageDrag` | Le Sage shadow-gravity structure |
| `entropic-gravity` | `verlindeForceLaw`, `screenBitSeries`, `ballRegion` | entropic (Verlinde) force |
| `gravitational-wave` | `keplerFrequency`, `chirpMass`, `binaryQuadrupoleStrain`, `petersInspiralTrack` | inspiral waveform quantities |
| `black-hole-thermodynamics` | `schwarzschildEntropy`, `hawkingTemperature`, `schwarzschildEvaporationLifetime` | horizon area, entropy, Hawking temperature |
| `ringdown-echo` | `sourceEnergyTrace`, `ringdownPersistence`, `detectEcho` | ringdown and echo detection |
| `unruh` | `unruhDetectorResponse`, `temperatureFromDetailedBalance` | Unruh detector response |
| `dirac-sea-energy` | `seaEnergyFromEigenvalues`, `diracSeaEnergy` | filled-sea vacuum energy |
| `superfluid` | `landauCriticalVelocity`, `vortexCirculation` | superfluid critical velocity and circulation |
| `hydrodynamics` | `shearAmplitudeSeries`, `chargeWaveSeries`, `momentumProfile` | shear and charge-wave hydrodynamics |
| `enstrophy` | `enstrophy` | vorticity content |
| `shear-mode` | `shearModeSeries`, `decoupledSlabMomentum`, `decayRateFit` | transverse shear-mode decay |
| `density-front` | `pairGasFill`, `excessProfileSeries`, `pulseMidpoint` | a density front moving through a gas |
| `density-contrast` | `densityContrast` | over/under-density contrast |

## Standard model and algebra structure

| module | key exports | what it returns |
| --- | --- | --- |
| `standard-model-charges` | `STANDARD_MODEL_GENERATION`, `weinbergAngleAtUnification`, `hyperchargeTrace` | one generation's charge assignment |
| `electroweak` | `custodialRho`, `wToZMassRatio` | electroweak mass ratios |
| `flavor-mixing` | `mixingAngleFromMassRatio`, `wolfensteinHierarchy` | CKM-style mixing from mass ratios |
| `generation-structure` | `exceptionalJordanGenerationStructure` | three generations from the exceptional Jordan algebra |
| `quaternionic-generations` | `octonionFanoLines`, `closesAsQuaternion`, `familyPermutation` | quaternionic subalgebras and family structure |
| `octonion-fermions` | `octonionFermionGeneration` | a fermion generation from the octonions |
| `division-algebra` | `cayleyMultiply`, `hasZeroDivisor`, `octonionTrialityCyclic` | the Cayley-Dickson division algebras |
| `base-forcing` | `toneAlphabetQualifies`, `minimalQualifyingAlphabetSize`, `hasTriality` | which tone alphabet the theory forces |
| `forced-ladder` | `forcedLadder`, `rungLaw`, `octonionNonassociativeTriples` | the forced dimension ladder |
| `collision-family` | `generationCosetStructure`, `linePairingForcingCurve` | generation structure from collisions |
| `code-lattice` | `evenWeightCode`, `reedMuller13`, `cssCode`, `constructionAMinimalVectors` | error-correcting codes and lattices |
| `skyrme-energy` | `hedgehogTexture3d`, `skyrmionCharge2d`, `directionFieldEnergy3d` | Skyrmion texture, charge, energy |
| `topological-charge` | `sphericalTriangleArea` | topological charge from solid angle |
| `winding` | `phaseWinding`, `directorWinding` | winding number of a phase or director field |
| `nuclear-binding` | `nuclearBindingEnergy`, `bindingPerNucleonAtMass`, `bindingCurvePeak` | nuclear binding curve |
| `molecular-bond` | `hydrogenMolecularIonBondingEnergy`, `hydrogenMolecularIonVariationalBond` | molecular bonding energy |
| `atomic-energy` | `heliumVariationalEnergy`, `optimalScreenedCharge`, `hartreeToEv` | atomic energy levels |
| `anyon-braiding` | `squareLoop`, `zNVortexHolonomy` | anyon braiding holonomy |
| `quantum-double` | `toricCodeGroundStateDegeneracy`, `totalQuantumDimension`, `topologicalEntanglementEntropy` | toric-code topological order |
| `consonance` | `harmonicTone`, `pureTone`, `intervalDissonance` | acoustic consonance of tones |
| `self-occlusion` | `directionalFacingFraction`, `trialityChiralFraction`, `spinorCoverFraction` | self-occlusion and triality fractions |
| `direction-distinguishability` | `d4Directions`, `fisherRaoSymmetryDeviation` | distinguishability of directions under D4 |

## Holography, memory, and routing

| module | key exports | what it returns |
| --- | --- | --- |
| `holography` | `ryuTakayanagiScaling`, `bulkShortcutScaling` | whether boundary entropy tracks the bulk geodesic |
| `associative-recall` | `exactRecallRate`, `nearestRecallRate`, `coverageRadius`, `radiusCapacity` | content-memory recall accuracy and capacity |
| `associative-memory` | `vsaRecallAccuracy` | vector-symbolic bind/bundle/unbind recall |
| `hierarchical-recall` | `buildRecallModel`, `leafPattern`, `recall` | hierarchical associative recall |
| `sequence-memory` | `buildSequenceMemory`, `sequenceStep`, `convergesToCycle` | sequence (temporal) memory |
| `imprint-retention` | `imprintRetention` | how long an imprint is retained |
| `sketch` | `cellHash`, `hashTableProbeStats`, `bloomFalsePositiveRate` | hashing and Bloom-filter math |
| `navigation` | `greedyRouteHops`, `greedyRoutingSuccess`, `routingWithBacktrack` | greedy routing success |
| `greedy-routing` | `poincareDistance`, `greedyRoute`, `scramblePermutation` | greedy routing on the hyperbolic metric |
| `bulk-routing` | `treeRouteLength`, `bulkPenetration`, `breakEvenSeparation` | tree versus chain routing cost |
| `cusp-distance` | `bulkTreeSamples`, `flatLineSamples`, `reachAtThreshold` | bulk-tree versus flat-line distance |
| `factorization` | `nearestSeedLabels`, `edgeRobustness`, `evenlySpacedSeeds` | seeded factor labelling |
| `factor-complexity` | `factorComplexity`, `factorComplexityProfile` | subword (factor) complexity |

## Statistics, fits, and time series

| module | key exports | what it returns |
| --- | --- | --- |
| `regression` | `powerLawFit`, `logLogSlope`, `linearFit`, `localForceLawExponent` | power-law, log-log, and linear fits |
| `histogram` | `histogramFlatness` | how uniform a distribution is |
| `spectrum` | `distinctLevels`, `zeroModeCensus` | distinct spectral levels, zero-mode count |
| `order-stats` | `orderStatistics`, `posetHeight`, `causalSliceWidths` | height and width shape of a poset |
| `look-elsewhere` | `lookElsewhereCount`, `menuCoverage`, `numerologyMenu` | the look-elsewhere (multiple-comparison) count |
| `numerology-density` | `closedFormHitCount` | how many closed forms a value hits by chance |
| `persistence` | `lagAutocorrelation` | temporal persistence (autocorrelation) |
| `recurrence` | `recurrencePeriod`, `asymmetricFill` | Poincare recurrence period |
| `churn` | `churnCount` | how much the state churns per beat |
| `avalanche` | `avalancheSizes`, `settledAvalancheSizes`, `toneDensity` | self-organized-criticality avalanche sizes |
| `action-fluctuation` | `actionFluctuationExponent` | how the action fluctuates with size |
| `time-spectrum` | `dominantAngularFrequency` | the dominant frequency of a time series |
| `fringe` | `fringeStatistics` | interference-fringe statistics |

## Fisher-Rao, coarse-graining, and coherence

| module | key exports | what it returns |
| --- | --- | --- |
| `fisher-rao` | `fisherRaoDistance`, `spatialActivityDistribution`, `cumulativeArcLength`, `windowSlope` | the information-geometry distance between activity distributions |
| `alignment` | `coherenceOrder`, `conflictFraction`, `meanPairwiseConflict`, `decisiveness` | alignment and conflict of a field |
| `agreement` | `agreementFraction`, `targetFidelity`, `clusterMajority` | agreement with a target pattern |
| `fill-coherence` | `fillCoherence`, `adaptFills`, `largestSharingPatch` | coherence of a fill pattern |
| `integration` | `algebraicConnectivity`, `toneIntegration`, `integrationCorrelates` | how integrated (hard to cut) the graph is |
| `monism-rhymes` | `chargeSpread`, `evolveCluster`, `nestedGarmentIdentity`, `blockAverage` | the monism (nested-garment) identities |
| `masked-centroid` | `maskedClusterCentroidX`, `maskedWillCentroidX` | centroid of a masked cluster |

## Cross-tessellation battery and substrate probes

| module | key exports | what it returns |
| --- | --- | --- |
| `tessellation-battery` | `measureTessellation`, `TessellationMeasurement` | one Schlafli symbol in, a full report out |
| `tessellation-profile` | `tessellationDataProfile`, `cellCoordination` | the data-structure profile (diameter, growth, addressing, capacity) |
| `tessellation-survey` | `surveyTessellation` | a survey pass over a tessellation |
| `cell-graph-spectral` | `cellGraphSpectral` | the spectral summary of a cell graph |
| `coordination-transfer` | `coneTypeTransferMatrix`, `largestCubicRoot`, `shellTypeVectors` | the shell transfer matrix and its growth root |
| `probe-directions` | `coordinateAxes`, `probeDirections` | canonical probe directions |
| `event-symmetry` | `ringLattice`, `scramblePermutation`, `graphObservable` | event-symmetry (relabelling) invariance |
| `exclusion` | `coreWithHalo`, `ringGraph`, `maximalComplex` | exclusion and nested-region structure |

## Entry points

### `fisherRaoDistance({ p, q })`
The information-geometry (Fisher-Rao) distance between two normalized activity distributions, `2 * arccos(sum sqrt(p*q))`. Pair it with `spatialActivityDistribution` (the per-cell activity as a probability distribution) and `blockActivityDistribution` (the coarse-block version). `cumulativeArcLength` sums the Fisher-Rao steps along a trajectory, the total distance a state travels in distribution space, and `windowSlope` fits the local growth rate. This is the flagship coarse-graining and selves observable.

### `measureTessellation({ schlafli })`
Score one tessellation end to end. Returns cell count, growth ratio, hyperbolicity, crystallographic flag, and the spinor hook. `tessellationDataProfile({ symbol, maxCells })` is the data-structure sibling (diameter, growth, addressing length, capacity). The one-module-per-tessellation pattern, run across the catalog by the cross-tessellation survey.

### `chsh(...)` and `ryuTakayanagiScaling({ neighbors, coords })`
`chsh` returns the CHSH Bell value `S` (above 2 breaks local realism, Tsirelson's bound is `2*sqrt(2)`). `ryuTakayanagiScaling` flags whether a region's boundary entropy scales like the bulk geodesic, the holography signal.

### `powerLawFit({ xs, ys })` and `spectralDimension(...)`
`powerLawFit` returns the best-fit exponent and the max deviation in log-log, the workhorse fit. `spectralDimension` reads effective dimension from a random-walk return, `ballGrowthDimension` from how ball size grows with radius.

## Used by

Every experiment in `test/experiment/` ends in a measure from here. `fisher-rao`, `alignment`, `integration`, and `monism-rhymes` drive the selves and coarse-graining arenas (deep dive `../coarse-graining-and-selves.md`). `associative-recall` and `sketch` drive the memory and data-structure arenas (`../associative-memory-engine.md`, `../api/computing-and-data-structures.md`). `holography` and `region-diameter` drive holography. `wilson-loop`, `entanglement`, and `dirac-sea-energy` read the operator spectra (`../spectral-engine.md`, `../fermion-engine.md`). The tessellation battery is the cross-tessellation survey (`../../cross-tessellation-experiments.md`).

## See also

- `../api/measure.md`, the friendly using-guide (the essentials with snippets).
- `operator.md`, the matrices whose spectra these measures read.
- `check.md`, the invariant checks (the conserved-quantity side).
