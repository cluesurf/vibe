import { Viewer } from '../../component/viewer'

export default function HoneycombPage(): React.ReactElement {
  return (
    <Viewer
      title="3D honeycombs"
      mode="3d-interior"
      hint="Inside a regular {p,q,r} honeycomb of hyperbolic 3-space, sphere-traced on the GPU. The cell edges are a lattice of struts that shrinks toward the horizon. Fly forward to fall through it."
      symbols={[
        { label: '{5,3,4} dodecahedral', value: [5, 3, 4] },
        { label: '{4,3,5} order-5 cubic', value: [4, 3, 5] },
        { label: '{3,5,3} icosahedral', value: [3, 5, 3] },
        { label: '{5,3,5}', value: [5, 3, 5] },
      ]}
    />
  )
}
