/**
 * A binary min-heap with a total, deterministic order: by `primary`, then
 * `secondary`, then the order of insertion. Two runs pop the same entries
 * in the same order, so a best-first search is a fixed function of its
 * problem.
 */

export interface QueueEntry<T> {
  primary: number
  secondary: number
  order: number
  value: T
}

function before<T>(a: QueueEntry<T>, b: QueueEntry<T>): boolean {
  if (a.primary !== b.primary) {
    return a.primary < b.primary
  }
  if (a.secondary !== b.secondary) {
    return a.secondary < b.secondary
  }
  return a.order < b.order
}

export class PriorityQueue<T> {
  private readonly heap: QueueEntry<T>[] = []
  private inserted = 0

  get size(): number {
    return this.heap.length
  }

  push(primary: number, secondary: number, value: T): void {
    const entry: QueueEntry<T> = { primary, secondary, order: this.inserted++, value }
    const heap = this.heap
    heap.push(entry)
    let index = heap.length - 1
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (!before(heap[index]!, heap[parent]!)) {
        break
      }
      const swap = heap[parent]!
      heap[parent] = heap[index]!
      heap[index] = swap
      index = parent
    }
  }

  pop(): QueueEntry<T> | undefined {
    const heap = this.heap
    const top = heap[0]
    const last = heap.pop()
    if (top === undefined || last === undefined || heap.length === 0) {
      return top
    }
    heap[0] = last
    let index = 0
    for (;;) {
      const left = 2 * index + 1
      const right = left + 1
      let best = index
      if (left < heap.length && before(heap[left]!, heap[best]!)) {
        best = left
      }
      if (right < heap.length && before(heap[right]!, heap[best]!)) {
        best = right
      }
      if (best === index) {
        break
      }
      const swap = heap[best]!
      heap[best] = heap[index]!
      heap[index] = swap
      index = best
    }
    return top
  }
}
