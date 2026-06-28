// Conformance for code/measure/anyon-braiding. A charge carried once counterclockwise around a Z_n
// vortex picks up the topological holonomy 2 pi / n (a boson for n = 1, a fermion = pi for n = 2,
// a fractional anyon for n > 2). A loop that does NOT enclose the flux picks up zero. The expected
// values are the Aharonov-Bohm winding (2 pi about an enclosed point, scaled by 1/n), derived here.

import { suite, check, close } from '@/test/code/harness'
import { squareLoop, zNVortexHolonomy } from '@/code/measure/anyon-braiding'

const TIGHT = 1e-9

// a counterclockwise square loop of half-size 2 about the origin, enclosing (0.5, 0.5).
const loop = squareLoop({ radius: 2, cx: 0, cy: 0 })

suite('measure/anyon-braiding: enclosing holonomy is 2 pi / n', [
  check('Z_3 fractional anyon: enclosed flux gives 2 pi / 3', () => {
    const h = zNVortexHolonomy({ states: 3, loop, fluxX: 0.5, fluxY: 0.5 })
    close(h, (2 * Math.PI) / 3, TIGHT)
  }),
  check('Z_2 fermion: enclosed flux gives pi', () => {
    const h = zNVortexHolonomy({ states: 2, loop, fluxX: 0.5, fluxY: 0.5 })
    close(Math.abs(h), Math.PI, TIGHT)
  }),
  check('Z_4 anyon: enclosed flux gives pi / 2', () => {
    const h = zNVortexHolonomy({ states: 4, loop, fluxX: 0.5, fluxY: 0.5 })
    close(h, Math.PI / 2, TIGHT)
  }),
])

suite('measure/anyon-braiding: the phase is topological (zero when not enclosed)', [
  check('a flux far outside the loop gives zero holonomy', () => {
    const h = zNVortexHolonomy({ states: 3, loop, fluxX: 50.5, fluxY: 50.5 })
    close(h, 0, TIGHT)
  }),
])
