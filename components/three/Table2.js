import { useGLTF } from "@react-three/drei"

useGLTF.preload("/assets/table-2.glb")


export default function Model(props) {
  const { nodes, materials } = useGLTF("/assets/table-2.glb")
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_4.geometry}
            material={materials.re_tb_01}
            scale={3}
          />
        </group>
      </group>
    </group>
  )
}
