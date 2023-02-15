import { RigidBody } from "@react-three/rapier"
import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

useGLTF.preload('/room.glb')

export function Model({rotation, position, scene, scale}) {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} position={position} rotation={rotation} scale={scale} />
    </RigidBody>
  )
}

export default function AllModels() {
  const { scene:sourceScene } = useGLTF('/room.glb')
  const scene1 = useMemo(() => sourceScene.clone(), [sourceScene])
  const scene2 = useMemo(() => sourceScene.clone(), [sourceScene])
  const scene3 = useMemo(() => sourceScene.clone(), [sourceScene])
  const scene4 = useMemo(() => sourceScene.clone(), [sourceScene])

  return (
    <>
      <Model scene={scene1} rotation={[0,0,0]} position={[20.4,-.05,-7.2]} scale={.3} /> 
      <Model scene={scene2} rotation={[0,Math.PI,0]} position={[-20.4,-.05,7.2]} scale={.3} />
      <Model scene={scene3} rotation={[0,Math.PI,0]} position={[20.4,-.05,7.2]} scale={[-.3,.3,.3]} />
      <Model scene={scene4} rotation={[0,Math.PI,0]} position={[-20.4,-.05,-7.2]} scale={[.3,.3,-.3]} />
    </>
  )
}
