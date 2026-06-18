import { Viewer } from '../../component/viewer'

export default function RoomsPage(): React.ReactElement {
  return (
    <Viewer
      title="3D rooms"
      mode="3d-interior"
      hint="First person inside the honeycomb, the rounded strut lattice of the cell edges receding to the hyperbolic horizon. Drag to look around, W to advance."
      symbols={[
        { label: '{5,3,4} dodecahedral', value: [5, 3, 4] },
        { label: '{4,3,5} order-5 cubic', value: [4, 3, 5] },
        { label: '{3,5,3} icosahedral', value: [3, 5, 3] },
        { label: '{5,3,5}', value: [5, 3, 5] },
      ]}
    />
  )
}
