import { useGLTF } from "@react-three/drei"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { useMemo } from "react"
import * as THREE from "three"

export default function Chairs({h}) {
  const { scene, materials:sourceMaterials, nodes } = useGLTF("/chair.glb")
  const material1 = useMemo(() => sourceMaterials["Material.001"].clone(), [sourceMaterials])
  const material2 = useMemo(() => sourceMaterials["Material.001"].clone(), [sourceMaterials])
  const material3 = useMemo(() => sourceMaterials["Material.001"].clone(), [sourceMaterials])
  const material4 = useMemo(() => sourceMaterials["Material.001"].clone(), [sourceMaterials])

  return (
    <>
      <Chair nodes={nodes} scene={scene} materials={material4} rotation={[-Math.PI / 2, 0, 0]} position={[-.55,0,3.5]} collider={[.55,1.2,-.05]} collider2={[.56, .2, -.6]} id={1} h={h} />
      <Chair nodes={nodes} scene={scene} materials={material1} rotation={[-Math.PI / 2, 0, Math.PI]} position={[.55,0,-3.5]} collider={[-.55,1.2,.05]} collider2={[-.56, .2, .6]} id={2} h={h} />
      <Chair nodes={nodes} materials={material2} rotation={[-Math.PI / 2, 0, -Math.PI/2]} position={[-3.5,0,-.55]} collider={[.05,1.2,.55]} collider2={[ .6, .2,.56]} id={3} h={h} />
      <Chair nodes={nodes} materials={material3} rotation={[-Math.PI / 2, 0, Math.PI/2]} position={[3.5,0,.55]} collider={[-.05,1.2,-.55]} collider2={[-.6, .2, -.56]} id={4} h={h} />
    </>
  )
}

function Chair({ rotation, position, nodes, materials, collider, collider2, id, h }) {
  const hitBoxPosition = [position[0] + collider[0], position[1]+collider[1], position[2]+collider[2]]
  const chairBottomPos = [position[0] + collider2[0], position[1]+collider2[1], position[2]+collider2[2]]

  if (id == 1) {
    materials.color = new THREE.Color("rgb(254, 225, 137)") // yellow
  } else if (id == 2) {
    materials.color = new THREE.Color("rgb(138, 138, 254)") // purple
  } else if (id == 3) {
    materials.color = new THREE.Color("rgb(99, 152, 213)") // blue
  } else {
    materials.color = new THREE.Color("rgb(201, 104, 104)") // red
  }

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_3.geometry}
        material={materials}
        rotation={rotation}
        position={position}
        scale={.3}
        onPointerDown={e => h(e, id)}
      />
      {/* [width, depth, height] */}
      <CuboidCollider args={[.58, .08 , 1.4]} position={hitBoxPosition} rotation={rotation} />
      <CuboidCollider args={[.57, .62, .94]} position={chairBottomPos} rotation={rotation} />
    </RigidBody>
  )
}

useGLTF.preload("/chair.glb")