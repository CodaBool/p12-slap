import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { useStore } from '../../pages'

export default function Ground(props) {
  const texture = useTexture("/assets/floor.jpg")
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <>
      <RigidBody type="fixed" position={[0, -15, 0]} colliders={false}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial />
        </mesh>
        <CuboidCollider args={[100,2,100]} />
      </RigidBody>
      <RigidBody {...props} type="fixed" colliders={false}>
        <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial map={texture} map-repeat={[240, 240]} />
        </mesh>
        <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
      </RigidBody>
    </>
  )
}