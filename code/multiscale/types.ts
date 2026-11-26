// Foundational types for Vibe Theory's proof-carrying multiscale modeling engine.
// Implements Note 17 Parts I, XIII, XIV, XXI-XXIII and Master Laws M01-M50:
//   - Strict separation of OrganizationInstance (concrete token) vs EntityType (abstract template)
//   - Explicit ErrorContract & Lean 4.35.0 ProofCertificate provenance
//   - Strict RefinementMode ('exact' | 'compatible' | 'statistical')
//   - Five structurally separated graphs (Field, Causal, Realization, Composition, Representation)
//   - Strictly quarantined PhenomenalHypothesis structurally incapable of posing as a certificate

export type TernaryValence = -1 | 0 | 1
export type Tick = bigint

export type SiteId = string
export type EventId = string
export type EntityId = string
export type EntityTypeId = string
export type ModelId = string
export type CertificateId = string

// Section 1: Four distinct forms of emergence (never collapse descriptive into causal or phenomenal).
export type EmergenceLevel =
  | 'descriptive'
  | 'structural'
  | 'causal'
  | 'phenomenal_hypothesis'

// Section 3: Four independent identity relations.
export type IdentityCriterion =
  | 'material'
  | 'structural'
  | 'causal'
  | 'phenomenal_hypothesis'

// Section 66: Valence profile V = (P, N, Q, D) preserving distinctions erased by net charge Q = 0.
export type ValenceProfile = {
  readonly positive: number
  readonly negative: number
  readonly netCharge: number
  readonly totalActivity: number
}

export function computeValenceProfile(
  values: readonly TernaryValence[],
): ValenceProfile {
  let positive = 0
  let negative = 0

  for (let i = 0; i < values.length; i++) {
    const v = values[i]!
    if (v > 0) {
      positive += v
    } else if (v < 0) {
      negative += -v
    }
  }

  return {
    positive,
    negative,
    netCharge: positive - negative,
    totalActivity: positive + negative,
  }
}

// Section 74 & Law M10 / M46: Explicit validity contract & error provenance.
export type ErrorBasis =
  | 'certified_theorem'
  | 'exhaustive_finite'
  | 'numerical_estimate'
  | 'heuristic'

export type ErrorCompositionRule =
  | 'triangle_lipschitz'
  | 'additive_independent'
  | 'exact_zero'

export type ValidityPredicate<State = unknown> = {
  readonly name: string
  readonly description: string
  readonly check: (state: State) => boolean
}

export type ErrorContract<State = unknown> = {
  readonly commutationBound: number
  readonly conservationBound: number
  readonly interfaceBound: number
  readonly horizonSteps: number
  readonly lipschitzFactor: number
  readonly observableMetric: string
  readonly basis: ErrorBasis
  readonly validityPredicates: readonly ValidityPredicate<State>[]
  readonly compositionRule: ErrorCompositionRule
}

// Section 75 & Laws M12-M13: Explicit refinement modes that never fabricate forgotten micro-history.
export type RefinementMode = 'exact' | 'compatible' | 'statistical'

export type WeightedMicroState<Fine> = {
  readonly state: Fine
  readonly probability: number
}

export type RefinementSuccess<Fine> = {
  readonly ok: true
  readonly mode: RefinementMode
  readonly state: Fine
  readonly exactMicroRestored: boolean
  readonly originalHistoryPreserved: boolean
  readonly restorationEntropyBits: number
  readonly suppliedResidualBits: number
  readonly distribution?: readonly WeightedMicroState<Fine>[]
  readonly constraintViolations: readonly string[]
}

export type RefinementFailure = {
  readonly ok: false
  readonly mode: RefinementMode
  readonly reason:
    | 'insufficient_residual_bits'
    | 'invalid_residual_key'
    | 'empty_fiber'
  readonly requiredBits: number
  readonly suppliedBits: number
  readonly exactMicroRestored: false
  readonly originalHistoryPreserved: false
  readonly constraintViolations: readonly string[]
}

export type RefinementOutcome<Fine> =
  | RefinementSuccess<Fine>
  | RefinementFailure

// Section 79: Formal Lean / numerical / conjectural proof certificates.
export type ProofTier =
  | 'tier_a_proved'
  | 'tier_b_numerical'
  | 'tier_c_conjecture'

export type ProofCertificate = {
  readonly certificateKind: 'dynamical_proof_certificate'
  readonly theoremId: string
  readonly leanModule: string
  readonly leanVersion: string
  readonly tier: ProofTier
  readonly scope: string
  readonly assumptions: readonly string[]
  readonly verified: boolean
}

// Sections 2, 73 & Laws M16, M17, M19, M20:
// EntityType is the abstract reusable template / equivalence class.
export type EntityType = {
  readonly id: EntityTypeId
  readonly name: string
  readonly description: string
  readonly emergenceLevel: EmergenceLevel
  readonly invariants: readonly string[]
  readonly stateSpaceSize: number
  readonly compatibleInterfaces: readonly string[]
}

export type Realization = {
  readonly sites: ReadonlySet<SiteId>
  readonly events: ReadonlySet<EventId>
  readonly components: readonly EntityId[]
}

export type IdentityBranchMode =
  | 'origin'
  | 'continuation'
  | 'fission'
  | 'fusion'

export type IdentityHistory = {
  readonly predecessors: readonly EntityId[]
  readonly createdAt: Tick
  readonly continuationOf?: EntityId
  readonly branchMode: IdentityBranchMode
}

// OrganizationInstance is a concrete realized token with its own causal history and realization.
export type OrganizationInstance<State = unknown> = {
  readonly id: EntityId
  readonly entityTypeId: EntityTypeId
  readonly state: State
  readonly tick: Tick
  readonly realization: Realization
  readonly identity: IdentityHistory
  readonly effectiveModelId: ModelId
  readonly errorContract: ErrorContract<State>
  readonly certificates: readonly ProofCertificate[]
}

// Law M16 & M17: Two organizations may share the exact same EntityType while remaining distinct tokens.
export function areSameTypeDifferentTokens<A, B>(
  first: OrganizationInstance<A>,
  second: OrganizationInstance<B>,
): boolean {
  return first.entityTypeId === second.entityTypeId && first.id !== second.id
}

// Section 71 & Laws M29, M33: Five cleanly separated typed graphs.
// Nominal graphKind discriminants prevent conflating physical adjacency, causality,
// realization, part-whole composition, and semantic representation.

export type FieldEdge = {
  readonly from: SiteId
  readonly to: SiteId
  readonly facet?: number
}

export type FieldGraph = {
  readonly graphKind: 'field_adjacency'
  readonly sites: readonly SiteId[]
  readonly edges: readonly FieldEdge[]
}

export type FieldEvent = {
  readonly id: EventId
  readonly site: SiteId
  readonly tick: Tick
  readonly before: TernaryValence
  readonly after: TernaryValence
}

export type CausalEdge = {
  readonly cause: EventId
  readonly effect: EventId
  readonly weight: number
}

export type CausalGraph = {
  readonly graphKind: 'causal_influence'
  readonly events: readonly FieldEvent[]
  readonly edges: readonly CausalEdge[]
}

export type RealizationLink = {
  readonly entityId: EntityId
  readonly realizedBySite?: SiteId
  readonly realizedByEvent?: EventId
  readonly realizedByEntity?: EntityId
}

export type RealizationGraph = {
  readonly graphKind: 'realization_mapping'
  readonly entityIds: readonly EntityId[]
  readonly siteIds: readonly SiteId[]
  readonly eventIds: readonly EventId[]
  readonly links: readonly RealizationLink[]
}

export type SharedInterfaceLink = {
  readonly id: string
  readonly sharedBetween: readonly [EntityId, EntityId]
  readonly overlapSpace: string
}

export type PartWholeEdge = {
  readonly part: EntityId
  readonly whole: EntityId
  readonly interfaceId?: string
}

export type CompositionGraph = {
  readonly graphKind: 'part_whole_composition'
  readonly organizations: readonly EntityId[]
  readonly interfaces: readonly SharedInterfaceLink[]
  readonly partEdges: readonly PartWholeEdge[]
}

export type GroundingMode =
  | 'causal_tracking'
  | 'convention'
  | 'formal_reference'
  | 'ungrounded_syntax'

export type InformationalRecord = {
  readonly id: string
  readonly holderEntityId: EntityId
  readonly encodedPayload: string
}

export type SemanticReference = {
  readonly recordId: string
  readonly targetId: string
  readonly grounding: GroundingMode
}

export type RepresentationGraph = {
  readonly graphKind: 'semantic_representation'
  readonly records: readonly InformationalRecord[]
  readonly references: readonly SemanticReference[]
}

export type MultiscaleGraphBundle = {
  readonly field: FieldGraph
  readonly causal: CausalGraph
  readonly realization: RealizationGraph
  readonly composition: CompositionGraph
  readonly representation: RepresentationGraph
}

export type FiveGraphValidation = {
  readonly valid: boolean
  readonly distinctGraphKinds: number
  readonly violations: readonly string[]
}

export function validateFiveGraphSeparation(
  bundle: MultiscaleGraphBundle,
): FiveGraphValidation {
  const violations: string[] = []
  const kinds = new Set<string>([
    bundle.field.graphKind,
    bundle.causal.graphKind,
    bundle.realization.graphKind,
    bundle.composition.graphKind,
    bundle.representation.graphKind,
  ])

  if (kinds.size !== 5) {
    violations.push('expected 5 distinct graph kinds')
  }

  const siteSet = new Set<SiteId>(bundle.field.sites)
  const eventSet = new Set<EventId>(bundle.causal.events.map(e => e.id))
  const eventTick = new Map<EventId, Tick>(
    bundle.causal.events.map(e => [e.id, e.tick]),
  )
  const realEntitySet = new Set<EntityId>(bundle.realization.entityIds)
  const orgSet = new Set<EntityId>(bundle.composition.organizations)
  const interfaceSet = new Set<string>(bundle.composition.interfaces.map(i => i.id))
  const recordSet = new Set<string>(bundle.representation.records.map(r => r.id))

  for (const edge of bundle.field.edges) {
    if (!siteSet.has(edge.from) || !siteSet.has(edge.to)) {
      violations.push(`field edge references unknown site (${edge.from}, ${edge.to})`)
    }
  }

  for (const ev of bundle.causal.events) {
    if (!siteSet.has(ev.site)) {
      violations.push(`causal event ${ev.id} references unknown site ${ev.site}`)
    }
  }

  for (const edge of bundle.causal.edges) {
    if (!eventSet.has(edge.cause) || !eventSet.has(edge.effect)) {
      violations.push(`causal edge references unknown event (${edge.cause}, ${edge.effect})`)
    } else {
      const tCause = eventTick.get(edge.cause)!
      const tEffect = eventTick.get(edge.effect)!
      if (tEffect < tCause) {
        violations.push(`causal edge violates temporal order (${edge.cause} -> ${edge.effect})`)
      }
    }
  }

  for (const link of bundle.realization.links) {
    if (!realEntitySet.has(link.entityId)) {
      violations.push(`realization link references undeclared entityId ${link.entityId}`)
    }
    if (!orgSet.has(link.entityId)) {
      violations.push(`realization link entity ${link.entityId} missing from composition organizations`)
    }
    if (link.realizedBySite !== undefined && !siteSet.has(link.realizedBySite)) {
      violations.push(`realization link ${link.entityId} references unknown site ${link.realizedBySite}`)
    }
    if (link.realizedByEvent !== undefined && !eventSet.has(link.realizedByEvent)) {
      violations.push(`realization link ${link.entityId} references unknown event ${link.realizedByEvent}`)
    }
    if (link.realizedByEntity !== undefined && !orgSet.has(link.realizedByEntity)) {
      violations.push(`realization link ${link.entityId} references unknown entity ${link.realizedByEntity}`)
    }
  }

  for (const iface of bundle.composition.interfaces) {
    const [e0, e1] = iface.sharedBetween
    if (!orgSet.has(e0) || !orgSet.has(e1)) {
      violations.push(`shared interface ${iface.id} references unknown entity (${e0}, ${e1})`)
    }
  }

  for (const pe of bundle.composition.partEdges) {
    if (!orgSet.has(pe.part) || !orgSet.has(pe.whole)) {
      violations.push(`composition edge references unknown entity (${pe.part} -> ${pe.whole})`)
    }
    if (pe.interfaceId !== undefined && !interfaceSet.has(pe.interfaceId)) {
      violations.push(`composition edge (${pe.part} -> ${pe.whole}) references unknown interface ${pe.interfaceId}`)
    }
  }

  for (const rec of bundle.representation.records) {
    if (!orgSet.has(rec.holderEntityId)) {
      violations.push(`record ${rec.id} held by unknown entity ${rec.holderEntityId}`)
    }
  }

  for (const ref of bundle.representation.references) {
    if (!recordSet.has(ref.recordId)) {
      violations.push(`semantic reference from unknown record ${ref.recordId}`)
    }
  }

  return {
    valid: violations.length === 0,
    distinctGraphKinds: kinds.size,
    violations,
  }
}

// Sections 43, 76 & Laws M35-M41, M47:
// PhenomenalHypothesis is structurally quarantined as an unverified hypothesis.
// Its literal epistemicStatus and discriminant make it impossible to pass as a ProofCertificate.
export type PhenomenalTestStatus =
  | 'proposed'
  | 'operationalized'
  | 'tested_inconclusive'
  | 'tested_falsified'

export type PhenomenalHypothesis = {
  readonly hypothesisKind: 'quarantined_phenomenal_hypothesis'
  readonly id: string
  readonly name: string
  readonly epistemicStatus: 'unverified_hypothesis'
  readonly testStatus: PhenomenalTestStatus
  readonly subjectSelectionRule: string
  readonly temporalIntegrationRule: string
  readonly contentConstitutionRule: string
  readonly relationalConstitutionRule: string
  readonly valenceConstitutionRule: string
  readonly perspectiveConstitutionRule: string
  readonly assumptions: readonly string[]
  readonly counterexamples: readonly string[]
  readonly targetEntityIds: readonly EntityId[]
}

export function isDynamicalCertificate(
  candidate: ProofCertificate | PhenomenalHypothesis,
): candidate is ProofCertificate {
  return (
    'certificateKind' in candidate &&
    candidate.certificateKind === 'dynamical_proof_certificate'
  )
}
