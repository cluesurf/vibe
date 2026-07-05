// The orbit of a seed element under a set of maps, closed by breadth-first
// search with a hash to dedupe. Used to count the finite orbit of a boundary
// configuration under the substrate's exact point symmetry, against which an
// unbounded continuous family is compared.

// Close `seed` under `maps` up to `cap` distinct elements. Returns the distinct
// elements found. If the closure exceeds `cap` the search stops and returns cap
// elements, which the caller reads as "not finite within the budget".
export function orbitClosure<Element>(input: {
  seed: Element
  maps: ((element: Element) => Element)[]
  hash: (element: Element) => string
  cap?: number
}): Element[] {
  const { seed, maps, hash } = input
  const cap = input.cap ?? 100000
  const seen = new Map<string, Element>()
  const queue: Element[] = [seed]
  seen.set(hash(seed), seed)

  while (queue.length > 0 && seen.size < cap) {
    const current = queue.shift()!

    for (const map of maps) {
      const next = map(current)
      const key = hash(next)

      if (!seen.has(key)) {
        seen.set(key, next)
        queue.push(next)
      }
    }
  }

  return [...seen.values()]
}
