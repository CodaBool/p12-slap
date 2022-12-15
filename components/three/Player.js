import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef, useEffect, useState, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { RigidBody, useRapier, CuboidCollider } from "@react-three/rapier"
import { useStore } from '../../pages'
import { socket } from '../../constants'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
// const rotation = new THREE.Vector3()

export default function Player({ lerp = THREE.MathUtils.lerp, gameLoop, slap }) {
  const [locked, setLocked] = useState()
  const [prevCamera, setPrevCamera] = useState()

  const ref = useRef()
  const rapier = useRapier()
  const { scene, camera } = useThree()
  const [, get] = useKeyboardControls()

  useEffect(() => {
    // create a crosshair and attach to camera
    const geometry = new THREE.CircleGeometry( .003, 12 )
    const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 })
    var crosshair = new THREE.Mesh( geometry, material )
    crosshair.position.x = 1 * camera.aspect
    crosshair.position.y = 1
    crosshair.position.z = -0.3
    scene.add( camera )
    camera.add( crosshair )
    crosshair.position.set( 0, 0, -1 )

    // create deck

    
    // update server position
    camera.rotation.set(0, Math.PI /2, 0)
    const interval = setInterval(() => {
      if (ref.current) {
        socket.emit('update', {
          cord: ref.current.translation(),
        })
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
          camera.position.set(0, 3.7, .7)
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

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)
    
    ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // jumping
    const world = rapier.world.raw()
    const ray = world.castRay(new RAPIER.Ray(ref.current.translation(), { x: 0, y: -1, z: 0 }))
    const grounded = ray && ray.collider && Math.abs(ray.toi) <= 1.75
    if (jump && grounded) ref.current.setLinvel({ x: 0, y: 7.5, z: 0 })

    // update socket

  })
  return (
    <RigidBody ref={ref} colliders={false} mass={1} position={[10, 5, 0]} enabledRotations={[false, false, false]}>
      <CuboidCollider args={[.5, 1.5, .5]} />
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 3, 1]} scale={10} />
        <meshStandardMaterial transparent opacity={0} color="blue" />
      </mesh>
    </RigidBody>
  )
}
