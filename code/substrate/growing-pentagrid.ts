// A {5,4} pentagrid that grows one cell at a time at its frontier, append-only, with no
// randomness and no rebuild. State persists between grow() calls, so growth can continue
// forever without rebuilding anything already grown. Each cell deterministically spawns its
// children by colour using the Fibonacci-tree splitting rule: a white cell emits
// (white, black, white), a black cell emits (white, black). The root seeds five white
// children (the central 5-gon). This is the dynamical, growing counterpart to the static
// tilingPQ({ p: 5, q: 4 }) placement: grown breadth-first it reproduces that tiling cell
// for cell, and its ball-growth ratio converges to the pentagrid's golden-ratio law phi^2.

export class GrowingPentagrid {
  parent: number[] = [-1] // node 0 is the root
  white: boolean[] = [true]
  adjacency: number[][] = [[]]
  // The frontier: cells whose children have not all been emitted yet, with a cursor into
  // their fixed child list. FIFO, so growth is breadth-first.
  private queue: { id: number; children: boolean[]; cursor: number }[] =
    [
      { id: 0, children: [true, true, true, true, true], cursor: 0 }, // root seeds 5 white children
    ]
  private head = 0

  // Children a cell spawns, by type: white -> (white, black, white), black -> (white, black).
  private childrenFor(white: boolean): boolean[] {
    return white ? [true, false, true] : [true, false]
  }

  size(): number {
    return this.parent.length
  }

  // Add exactly `count` cells at the frontier.
  grow(count: number): void {
    let added = 0
    while (added < count) {
      const task = this.queue[this.head]
      if (task === undefined) {
        return // frontier exhausted (only happens if count exceeds an unstarted root)
      }
      if (task.cursor >= task.children.length) {
        this.head += 1 // this cell is fully expanded, advance the frontier
        continue
      }
      const childWhite = task.children[task.cursor] ?? true
      task.cursor += 1
      const id = this.parent.length
      this.parent.push(task.id)
      this.white.push(childWhite)
      this.adjacency.push([task.id])
      this.adjacency[task.id]!.push(id)
      this.queue.push({
        id,
        children: this.childrenFor(childWhite),
        cursor: 0,
      })
      added += 1
    }
  }
}
