import { Viewer } from '../../component/viewer'

export default function TilingPage(): React.ReactElement {
  return (
    <Viewer
      title="2D tilings"
      mode="2d"
      hint="A regular {p,q} tiling of the hyperbolic plane, folded per-pixel on the GPU. Walk it like HyperRogue."
      symbols={[
        { label: '{7,3} heptagonal', value: [7, 3] },
        { label: '{5,4} pentagonal', value: [5, 4] },
        { label: '{8,3} octagonal', value: [8, 3] },
        { label: '{6,4}', value: [6, 4] },
        { label: '{5,5}', value: [5, 5] },
        { label: '{4,6}', value: [4, 6] },
      ]}
    />
  )
}
