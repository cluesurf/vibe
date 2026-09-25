// The claim graph, assembled, and the three questions asked of it.
//
//   shown(id)        what a node reads as: its own standing, or `dependency_challenged` when
//                    anything beneath it is challenged or broken. Computed, never stored, so a
//                    downstream claim cannot be left standing in silence.
//   assumptions(id)  every assumption a node rests on, through any depth. What it does NOT
//                    rest on is the complement, and that is as important.
//   dependents(id)   every node that rests on this one, which is what a break would reach.
//
// It also enforces the prediction gate: `refusals()` lists every prediction row whose result
// does not pass every criterion in PREDICTION, and the projection refuses to write while the
// list is not empty.

import { ASSUMPTIONS, DEFINITIONS, IMPORTS, LEMMAS, OBSERVATIONS } from './node'
import { RESULTS } from './result'
import { PREDICTIONS } from './prediction'
import { SUBMISSIONS } from './challenge'
import { PREDICTION } from './type'
import type { Criterion, Node, Standing } from './type'

export type Shown = Standing | 'dependency_challenged'

const RANK: Record<Shown, number> = {
  holds: 0,
  dependency_challenged: 1,
  challenged: 2,
  broken: 3,
}

// A result's own standing, from its challenge submissions. An undecided submission challenges
// it, a successful one breaks it, and a corrected or survived one leaves it holding.
function standingOf(code: string): Standing {
  const submissions = SUBMISSIONS.filter(s => s.result === code)

  if (submissions.some(s => s.status === 'broken')) {
    return 'broken'
  }

  if (submissions.some(s => s.status === 'open')) {
    return 'challenged'
  }

  return 'holds'
}

function buildNodes(): Map<string, Node> {
  const nodes = new Map<string, Node>()

  for (const node of [...ASSUMPTIONS, ...DEFINITIONS, ...LEMMAS, ...IMPORTS, ...OBSERVATIONS]) {
    nodes.set(node.id, node)
  }

  // One simulation node per experiment code. An experiment shared by two results keeps the
  // union of what they say it rests on.
  for (const result of RESULTS) {
    for (const experiment of result.experiments) {
      const existing = nodes.get(experiment.code)
      const depends = new Set([...(existing?.depends ?? []), ...experiment.depends])

      nodes.set(experiment.code, {
        id: experiment.code,
        kind: 'simulation',
        statement: experiment.file,
        standing: 'holds',
        depends: [...depends],
      })
    }
  }

  for (const result of RESULTS) {
    nodes.set(result.code, {
      id: result.code,
      kind: 'result',
      statement: result.title,
      standing: standingOf(result.code),
      depends: [...result.depends, ...result.experiments.map(e => e.code)],
    })
  }

  for (const prediction of PREDICTIONS) {
    nodes.set(prediction.id, {
      id: prediction.id,
      kind: 'prediction',
      statement: prediction.vibe,
      standing: prediction.outcome === 'refuted' ? 'broken' : 'holds',
      depends: [prediction.result],
    })
  }

  return nodes
}

export const NODES = buildNodes()

export function shown(id: string, seen = new Set<string>()): Shown {
  const node = NODES.get(id)

  if (!node || seen.has(id)) {
    return 'holds'
  }

  seen.add(id)

  const beneath = node.depends.some(d => shown(d, seen) !== 'holds')
    ? 'dependency_challenged'
    : 'holds'

  return RANK[node.standing] >= RANK[beneath] ? node.standing : beneath
}

export function assumptions(id: string, seen = new Set<string>()): string[] {
  const found = new Set<string>()
  const node = NODES.get(id)

  if (!node || seen.has(id)) {
    return []
  }

  seen.add(id)

  for (const dependency of node.depends) {
    if (NODES.get(dependency)?.kind === 'assumption') {
      found.add(dependency)
    }

    for (const deeper of assumptions(dependency, seen)) {
      found.add(deeper)
    }
  }

  return [...found].sort()
}

export function dependents(id: string): string[] {
  const found = new Set<string>()
  const queue = [id]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const node of NODES.values()) {
      if (node.depends.includes(current) && !found.has(node.id)) {
        found.add(node.id)
        queue.push(node.id)
      }
    }
  }

  return [...found].sort()
}

// Every prediction row whose result fails a criterion the prediction gate requires.
export function refusals(): { prediction: string; unmet: Criterion[] }[] {
  return PREDICTIONS.flatMap(prediction => {
    const result = RESULTS.find(r => r.code === prediction.result)
    const unmet = result
      ? PREDICTION.filter(c => result.gate[c].mark !== 'pass')
      : [...PREDICTION]

    return unmet.length > 0 ? [{ prediction: prediction.id, unmet }] : []
  })
}

// Every dependency id that names no node. A dangling id is a claim resting on nothing.
export function dangling(): { node: string; missing: string }[] {
  const found: { node: string; missing: string }[] = []

  for (const node of NODES.values()) {
    for (const dependency of node.depends) {
      if (!NODES.has(dependency)) {
        found.push({ node: node.id, missing: dependency })
      }
    }
  }

  return found
}
