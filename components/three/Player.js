import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef, useEffect, useState, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { RigidBody, useRapier, CuboidCollider } from "@react-three/rapier"
import { stack } from '../../pages'
import { socket } from '../../constants'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
// const rotation = new THREE.Vector3()

export default function Player({ lerp = THREE.MathUtils.lerp, gameLoop, slap }) {
  const [locked, setLocked] = useState()
  const [prevCamera, setPrevCamera] = useState()
  const { scene, camera } = useThree()
  const [, get] = useKeyboardControls()
  const ref = useRef()
  const rapier = useRapier()

  useEffect(() => {
    scene.add( camera )
    
    // update server position
    camera.rotation.set(0, Math.PI /2, 0)
    const interval = setInterval(() => {
      if (ref.current) {
        // socket.emit('update', {
        //   cord: ref.current.translation(),
        // })
      }
    }, 40)
    return () => clearInterval(interval)
  }, [])

  // function removeCards(scene) {
  //   var selectedObject = scene.getObjectByName(object.name);
  //   scene.remove( selectedObject );
  //   animate();
  // }

  function mouseEvent(e) {
    if (e.buttons === 2) { // RMB
      setLocked(state => {
        if (state) { // locked -> unlocked
          camera.rotation.set(prevCamera[0], prevCamera[1], prevCamera[2])
        } else { // unlocked -> locked
          setPrevCamera([camera.rotation._x, camera.rotation._y, camera.rotation._z])
          let size = 0
          stack.forEach(() => size++)
          camera.position.set(0, 3.7 + (size * .05), .7)
          camera.rotation.set(-Math.PI /2.5, 0, 0)
        }
        return !state
      })
    } else if (e.buttons === 1) { // LMB
      if (locked) {
        gameLoop()
      }
    }
  }

  function keyEvent(e) {
    if (e.key === " ") {
      if (locked) {
        slap()
      }
    }
  }

  useEffect(() => {
    window.addEventListener("mousedown", mouseEvent)
    window.addEventListener("keydown", keyEvent)
    return () => {
      window.removeEventListener("mousedown", mouseEvent)
      window.removeEventListener("keydown", keyEvent)
    }
  }, [mouseEvent, keyEvent])

  useFrame((state) => {
    if (locked) return
    const { forward, backward, left, right, jump, run } = get()
    const velocity = ref.current.linvel()
    // update camera
    
    camera.position.set(ref.current.translation().x, ref.current.translation().y  +2.5, ref.current.translation().z )
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    // console.log(ref.current.position.x, ref.current.position.y + 2.5, ref.current.position.z)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)

    // console.log('set', direction.x, velocity.current[1], direction.z)
    // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
    ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // // jumping
    const ray = rapier.world.raw().castRay(new RAPIER.Ray(ref.current.translation(), { x: 0, y: -1, z: 0 }))
    if (jump && ray && ray.collider && Math.abs(ray.toi) <= 1.75) ref.current.setLinvel({ x: 0, y: 3, z: 0 })

    // update socket

  })
  return (
    <RigidBody ref={ref} colliders={false} position={[-6, 1, 0]} enabledRotations={[false, false, false]}>
      <CuboidCollider args={[.5, 1.5, .5]} />
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 3, 1]} scale={10} />
        <meshStandardMaterial transparent opacity={0} color="blue" />
      </mesh>
    </RigidBody>
  )
}
