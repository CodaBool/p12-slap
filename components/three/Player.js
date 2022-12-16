import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef, useEffect, useState, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useBox } from '@react-three/cannon'
import { useStore } from '../../pages'
import { socket } from '../../constants'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
// const rotation = new THREE.Vector3()

export default function Player({ lerp = THREE.MathUtils.lerp, gameLoop, slap }) {
  const [ref, api] = useBox(() => ({ type: 'Kinematic', position: [10,2,0]  }))
  const [locked, setLocked] = useState()
  const [prevCamera, setPrevCamera] = useState()
  const { scene, camera } = useThree()
  const [, get] = useKeyboardControls()
  const velocity = useRef([0, 0, 0])
  const position = useRef([0, 0, 0])

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

    const unsubscribePos = api.position.subscribe(p => (position.current = p))
    const unsubscribeVel = api.velocity.subscribe(v => (velocity.current = v))
    
    // update server position
    camera.rotation.set(0, Math.PI /2, 0)
    const interval = setInterval(() => {
      if (ref.current) {
        socket.emit('update', 'hi coords go here')
      }
    }, 40)
    return () => {
      clearInterval(interval)
      unsubscribePos()
      unsubscribeVel()
    }
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

  // console.log('api', api)
  // console.log('ref', ref)

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
    // update camera
    
    camera.position.set(position.current[0], position.current[1] + 2, position.current[2] )
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    // console.log(ref.current.position.x, ref.current.position.y + 2.5, ref.current.position.z)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)

    // console.log('set', direction.x, velocity.current[1], direction.z)
    // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
    api.velocity.set(direction.x, velocity.current[1], direction.z)
    // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // // jumping
    // const world = rapier.world.raw()
    // const ray = world.castRay(new RAPIER.Ray(ref.current.translation(), { x: 0, y: -1, z: 0 }))
    // const grounded = ray && ray.collider && Math.abs(ray.toi) <= 1.75
    // if (jump && grounded) ref.current.setLinvel({ x: 0, y: 7.5, z: 0 })

    // update socket

  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 3, 1]} scale={1} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}
