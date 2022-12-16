import { useGLTF } from "@react-three/drei"
import { useCylinder } from '@react-three/cannon'

useGLTF.preload("/assets/table.glb")

export default function Model() {
  const [ref] = useCylinder(() => ({ type: 'Static', args: [2,2,2], position: [0,1,0]  }))
  const { nodes, materials } = useGLTF("/assets/table.glb")
  return (
    <group ref={ref}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial001.geometry}
        material={materials.DefaultMaterial}
        position={[0, -.6, 0]}
        rotation={[-Math.PI, 0, 0]}
        scale={2}
      />
    </group>
  )
}