import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import { useBox, usePlane } from '@react-three/cannon'
import { useStore } from '../../pages'

export default function Ground(props) {
  const [topPlane] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], type: 'Static' }))
  // const [bottomPlane] = usePlane(() => ({ rotation: [-Math.PI / 2, 0,0], type: 'Static', position: [0, -30, 0] })) //  position: [0, 0, 0]

  const texture = useTexture("/assets/floor.jpg")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <>
      <mesh ref={topPlane} receiveShadow >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial map={texture} map-repeat={[240, 240]} />
      </mesh>
    </>
  )
}