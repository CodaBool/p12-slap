import { useGLTF } from "@react-three/drei"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { socket } from '../../constants'
import { useStore } from '../../pages/game'

export default function Chairs({h}) {

  const { nodes, materials } = useGLTF("/assets/chair.glb")
  return (
    <>x
      <Chair nodes={nodes} materials={materials} rotation={[-Math.PI / 2, 0, 0]} position={[-.55,0,3.5]} collider={[.55,1.2,-.05]} collider2={[.56, .2, -.6]} id={1} h={h} />
      <Chair nodes={nodes} materials={materials} rotation={[-Math.PI / 2, 0, Math.PI]} position={[.55,0,-3.5]} collider={[-.55,1.2,.05]} collider2={[-.56, .2, .6]} id={2} h={h} />
      <Chair nodes={nodes} materials={materials} rotation={[-Math.PI / 2, 0, -Math.PI/2]} position={[-3.5,0,-.55]} collider={[.05,1.2,.55]} collider2={[ .6, .2,.56]} id={3} h={h} />
      <Chair nodes={nodes} materials={materials} rotation={[-Math.PI / 2, 0, Math.PI/2]} position={[3.5,0,.55]} collider={[-.05,1.2,-.55]} collider2={[-.6, .2, -.56]} id={4} h={h} />
    </>
  )
}

function Chair({ rotation, position, nodes, materials, collider, collider2, id, h }) {
  const hitBoxPosition = [position[0] + collider[0], position[1]+collider[1], position[2]+collider[2]]
  const chairBottomPos = [position[0] + collider2[0], position[1]+collider2[1], position[2]+collider2[2]]

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_3.geometry}
        material={materials["Material.001"]}
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

useGLTF.preload("/assets/chair.glb")