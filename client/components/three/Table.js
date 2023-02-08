import { useGLTF } from "@react-three/drei"
import { RigidBody, CylinderCollider } from "@react-three/rapier"

export default function Model() {
  const { nodes, materials } = useGLTF("/table.glb")
  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial001.geometry}
        material={materials.DefaultMaterial}
        position={[0, .42, 0]}
        rotation={[-Math.PI, Math.PI/4, 0]}
        scale={2}
      />
      <CylinderCollider args={[1.5,2,1]} position={[0, .54, 0]} />
    </RigidBody>
  )
}

useGLTF.preload("/table.glb")