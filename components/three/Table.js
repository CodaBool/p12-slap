import { useGLTF } from "@react-three/drei"
import { RigidBody, CylinderCollider, CuboidCollider } from "@react-three/rapier"

useGLTF.preload("/assets/table.glb")

export default function Model(props) {
  const { nodes, materials } = useGLTF("/assets/table.glb")
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <group {...props}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial001.geometry}
            material={materials.DefaultMaterial}
            position={[0, .42, 0]}
            rotation={[-Math.PI, 0, 0]}
            scale={2}
          />
        </group>
        <CylinderCollider args={[1.5,2,1]} position={[0, .54, 0]} />
      </RigidBody>
    </>
  )
}