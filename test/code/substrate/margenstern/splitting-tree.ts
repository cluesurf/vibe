// Conformance for code/substrate/margenstern/splitting-tree: the pentagrid/heptagrid as a regular language
// over Zeckendorf words. A white tile has 3 children (append 00/01/10), a black tile 2 (append 00/01); no
// child ever forms a forbidden "11"; the parent strips the last two digits; and the materialized tree keeps
// addresses and parents consistent. All exact string/integer surgery.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  colorOf,
  childrenOf,
  preferredSon,
  parentOf,
  coordinateOf,
  SplittingTree,
  SECTOR_ROOT,
} from '@/code/substrate/margenstern/splitting-tree'
import {
  isZeckendorf,
  fromZeckendorf,
} from '@/code/substrate/margenstern/zeckendorf'

suite('substrate/margenstern/splitting-tree: the splitting rule', [
  check('white tiles take 3 children, black tiles take 2', () => {
    equal(colorOf('10'), 'white', '10 ends in 0')
    equal(colorOf('1001'), 'black', '1001 ends in 1')
    equal(childrenOf('10').length, 3, 'white child count')
    equal(childrenOf('1001').length, 2, 'black child count')
  }),
  check(
    'children are the address plus 00/01/(10), preferred son first',
    () => {
      const kids = childrenOf('10')
      equal(kids[0], '1000', 'preferred')
      equal(kids[0], preferredSon('10'), 'preferred = +00')
      equal(kids[1], '1001', 'second')
      equal(kids[2], '1010', 'third (white only)')
    },
  ),
  check('no child address contains a forbidden "11"', () => {
    // Walk the sector tree to depth ~7 and verify every produced address is legal.
    let frontier = [SECTOR_ROOT]

    for (let level = 0; level < 7; level++) {
      const next: string[] = []

      for (const a of frontier) {
        for (const c of childrenOf(a)) {
          notOk(c.includes('11'), `${c} has no 11`)
          ok(isZeckendorf(c), `${c} is legal`)
          next.push(c)
        }
      }

      frontier = next
    }
  }),
  check(
    'the parent strips the last two digits and inverts childrenOf',
    () => {
      equal(parentOf('1000'), '10', 'strip two')
      equal(parentOf('10'), null, 'root has no parent')

      let frontier = [SECTOR_ROOT]

      for (let level = 0; level < 6; level++) {
        const next: string[] = []

        for (const a of frontier) {
          for (const c of childrenOf(a)) {
            equal(parentOf(c), a, `parent(${c}) = ${a}`)
            next.push(c)
          }
        }

        frontier = next
      }
    },
  ),
  check('the coordinate is the Zeckendorf value of the address', () => {
    equal(
      coordinateOf('10'),
      fromZeckendorf('10'),
      'coordinate = Zeckendorf value',
    )
    equal(coordinateOf(SECTOR_ROOT), 2, 'sector root coordinate')
  }),
])

suite('substrate/margenstern/splitting-tree: the materialized tree', [
  check(
    'growth materializes consistent parents and unique addresses',
    () => {
      const tree = new SplittingTree()
      tree.grow(80)
      ok(tree.size >= 80, 'grew to at least 80 cells')

      const seen = new Set<string>()

      for (let id = 0; id < tree.size; id++) {
        const a = tree.address(id)
        ok(isZeckendorf(a), `address ${a} legal`)
        notOk(seen.has(a), `address ${a} unique`)
        seen.add(a)

        const p = tree.parent(id)

        if (p >= 0) {
          equal(parentOf(a), tree.address(p), `parent address of ${a}`)
        }
      }
    },
  ),
  check('every non-root cell is one of its parent children', () => {
    const tree = new SplittingTree()
    tree.grow(60)

    for (let id = 1; id < tree.size; id++) {
      const p = tree.parent(id)
      ok(
        childrenOf(tree.address(p)).includes(tree.address(id)),
        `${id} is a child of ${p}`,
      )
    }
  }),
  check('pathToRoot reaches the root', () => {
    const tree = new SplittingTree()
    tree.grow(40)

    for (let id = 0; id < tree.size; id++) {
      const path = tree.pathToRoot(id)
      equal(path[0], id, 'starts at the node')
      equal(path[path.length - 1], tree.root, 'ends at the root')
    }
  }),
])
