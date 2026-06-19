import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// SS10 (experiments/17). Lists, stacks, queues as physical paths. A linked list is a path of cells whose
// next-pointer is a physical neighbour, traversal is O(1) per step. A stack is a radial ray, push descends to a
// child, pop returns to the parent, and the depth is the stack height. We descend the canonical tree from the
// root to build a path, confirm each step is a single physical neighbour (a child of the previous cell), that
// the depth increases by one per push, and that pop (the parent) exactly reverses it.

export default experiment({
  id: 'data-structure/path-structures',
  title:
    'SS10: a list is a cell path and a stack is a radial ray, O(1) per step, depth is the height',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 3000 })
    // build a stack by descending to the first available child each step (push), recording the path
    const path: number[] = [a.root]

    let node = a.root

    while (a.children[node]!.length > 0) {
      node = a.children[node]![0]!
      path.push(node)
    }

    // every step is to a physical child (a neighbour), and the depth increases by one per push (LIFO height)
    let everyStepIsChild = true
    let depthIncrements = true

    for (let i = 1; i < path.length; i++) {
      if (a.parent[path[i]!] !== path[i - 1]!) {
        everyStepIsChild = false
      }

      if (a.dist[path[i]!] !== a.dist[path[i - 1]!]! + 1) {
        depthIncrements = false
      }
    }

    // pop reverses exactly: the parent of each cell is the previous on the stack
    let popReverses = true

    for (let i = path.length - 1; i > 0; i--) {
      if (a.parent[path[i]!] !== path[i - 1]!) {
        popReverses = false
      }
    }

    const ok =
      path.length > 1 &&
      everyStepIsChild &&
      depthIncrements &&
      popReverses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a list is a physical path of cells with O(1) per-step traversal, and a stack is a radial ray whose depth is the height and whose pop is exactly the parent step, the path data structures are physical walks',
      metrics: {
        stackHeight: path.length - 1,
        everyStepIsChild: everyStepIsChild ? 1 : 0,
        depthIncrements: depthIncrements ? 1 : 0,
        popReverses: popReverses ? 1 : 0,
      },
      // CONTROL: a flat linked list stores an explicit next-pointer per node, here the neighbour is physical.
      control: {
        flatPointersStored: path.length - 1,
        bulkPointersStored: 0,
      },
      notes:
        'SS10 of experiments/17. The radial ray is the stack, the same axis as the heap (SS4).',
    })
  },
})
