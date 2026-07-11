import { Link } from 'react-router'

const VIEWS = [
  {
    to: '/tiling',
    accent: 'violet',
    title: '2D tilings',
    body: 'Walk a regular {p,q} tiling of the hyperbolic plane.',
  },
  {
    to: '/honeycomb',
    accent: 'blue',
    title: '3D honeycombs',
    body: 'Sphere-trace a {p,q,r} honeycomb of hyperbolic space.',
  },
  {
    to: '/rooms',
    accent: 'emerald',
    title: '3D rooms',
    body: 'Fly the textured interior corridors, first person.',
  },
]

export default function HomePage(): React.ReactElement {
  return (
    <main className='home'>
      <header>
        <h1>vibe</h1>
        <p>
          An interactive WebGPU renderer for hyperbolic tilings and
          honeycombs. Everything is folded per-pixel on the GPU,
          navigated like HyperRogue.
        </p>
      </header>
      <nav className='cards'>
        {VIEWS.map(v => (
          <Link
            key={v.to}
            to={v.to}
            className={`card card-${v.accent}`}
          >
            <h2>{v.title}</h2>
            <p>{v.body}</p>
            <span className='go'>open →</span>
          </Link>
        ))}
      </nav>
      <footer>
        <p>
          Use W/A/S/D or the arrow keys to move, drag to look, the wheel
          to zoom. The renderer lives in <code>code/render</code>; this
          app only mounts it.
        </p>
      </footer>
    </main>
  )
}
