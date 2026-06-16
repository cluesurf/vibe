import { Viewer } from '../../component/viewer'

export default function RoomsPage(): React.ReactElement {
  return (
    <Viewer
      title="3D rooms"
      mode="3d-interior"
      hint="Stand inside a single cell and fly the textured corridors, the first-person interior of the honeycomb."
      symbols={[
        { label: '{5,3,4} dodecahedral rooms', value: [5, 3, 4] },
        { label: '{4,3,5} cubic rooms', value: [4, 3, 5] },
        { label: '{3,5,3} icosahedral rooms', value: [3, 5, 3] },
      ]}
    />
  )
}
