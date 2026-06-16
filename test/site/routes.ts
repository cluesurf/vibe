import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('./page/page.tsx'),
  route('tiling', './page/tiling/page.tsx'), // 2D {p,q} tilings
  route('honeycomb', './page/honeycomb/page.tsx'), // 3D {p,q,r} honeycombs, from outside
  route('rooms', './page/rooms/page.tsx'), // 3D interior, the textured solid cells
] satisfies RouteConfig
