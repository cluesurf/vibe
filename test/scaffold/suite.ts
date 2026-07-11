import { Verdict } from '@/test/scaffold/verdict'

// The test unit. Every test exports one Experiment through experiment, so
// the catalog (category, substrate, depth, paper) lives in the code instead of a
// separate spreadsheet, and the suites read the registry.

export type Category =
  | 'foundations'
  | 'geometry'
  | 'relativity'
  | 'spin'
  | 'gauge'
  | 'gravity'
  | 'cosmology'
  | 'holography'
  | 'quantum'
  | 'renormalization'
  | 'selves'
  | 'computation'
  | 'addressing'
  | 'data-structure'
  | 'associative'
  | 'substrate-survey'
  | 'fluids'
  | 'method'

export type Depth = 'L0' | 'L1' | 'L2' | 'L3'

export type Context = {
  seed: number
}

export type Experiment = {
  id: string
  // The stable database code, E-<3-consonant-arena>-<4-digit>, e.g. E-RLT-0007. Optional so older
  // experiments keep working; the registry (test/registry.csv) maps every code to its file, and the
  // arena codes are defined in test/codes.csv.
  code?: string
  title: string
  category: Category
  substrates: string[] | 'any'
  depth: Depth
  paper: boolean
  run(context: Context): Verdict
}

const registry = new Map<string, Experiment>()

export function experiment(definition: Experiment): Experiment {
  if (registry.has(definition.id))
    throw new Error(`duplicate experiment id: ${definition.id}`)

  registry.set(definition.id, definition)

  return definition
}

export function allExperiments(): Experiment[] {
  return [...registry.values()]
}

export type SuiteResult = {
  id: string
  verdict: Verdict
}

// Run a set of experiments. The integrity rule, an experiment that declares a
// deep (L3) result must return a control, otherwise the runner downgrades it to
// partial. This is what stops a circular test from quietly printing green.
export function runSuite(
  experiments: Experiment[],
  context: Context,
): SuiteResult[] {
  return experiments.map(experiment => {
    const result = experiment.run(context)
    const hasControl =
      result.control !== undefined &&
      Object.keys(result.control).length > 0

    if (experiment.depth === 'L3' && !hasControl) {
      return {
        id: experiment.id,
        verdict: {
          ...result,
          status: 'partial',
          notes:
            `${result.notes ?? ''} [downgraded: an L3 claim must carry a control]`.trim(),
        },
      }
    }

    return { id: experiment.id, verdict: result }
  })
}
