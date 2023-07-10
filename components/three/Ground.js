import { CuboidCollider, RigidBody } from "@react-three/rapier"

export default function Ground() {
  return (
    <RigidBody type="fixed">
      <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
    </RigidBody>
  )
}