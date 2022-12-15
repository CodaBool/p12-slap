import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { socket } from '../../constants'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export default function EnemyBasic(props) {
  let fakePos = {x:10, y:.4, z:0}
  useEffect(() => {
    socket.on('updated', data => {
      // console.log(data.cord)
      fakePos = {x: data.cord.x, y: data.cord.y, z: data.cord.z}
    })
    return () => socket.removeAllListeners('updated')
  }, [])
  
  // let smallDif = 1 // .3+
  // let dif = 5 // .3+
  // let bigDif = 50 // 3+
  // useFrame((state) => {
  //   // console.log(ref.current)
  //   const velocity = ref.current.linvel()
  //   // let fakePos = {x:0, y:.4, z:0}
  //   const distance = Math.hypot(fakePos.x-ref.current.translation().x, fakePos.z-ref.current.translation().z)
  //   if (distance < 0.3 && distance > 0.05) {
  //     console.log('small teleporting', distance)
  //     ref.current.setTranslation(fakePos, true)
  //   } else if (distance < dif) {
  //     if (distance > smallDif) {
  //       console.log('push', distance)
  //       if (fakePos.z-ref.current.translation().z > 0) { // down
  //         frontVector.set(0, 0, 1)
  //       } else { // up
  //         frontVector.set(0, 0, -1)
  //       }
  //       if (fakePos.x-ref.current.translation().x > 0) { // right
  //         sideVector.set(-1, 0, 0)
  //       } else { // left
  //         sideVector.set(1, 0, 0)
  //       }
  //       direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(0.2)
  //       ref.current.applyImpulse({ x: direction.x, y: velocity.y, z: direction.z }, true)
  //       // ref.current.setTranslation(fakePos, true)
  //     }
  //   } else if (distance > dif) {
  //     // console.log('giving velocity', SPEED*distance)
  //     if (fakePos.z-ref.current.translation().z > 0) { // down
  //       frontVector.set(0, 0, 1)
  //     } else { // up
  //       frontVector.set(0, 0, -1)
  //     }
  //     if (fakePos.x-ref.current.translation().x > 0) { // right
  //       sideVector.set(-1, 0, 0)
  //     } else { // left
  //       sideVector.set(1, 0, 0)
  //     }
  //     direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED)
  //     ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
  //   } else if (distance > bigDif) { // should teleport
  //     console.log('big teleporting', distance)
  //     ref.current.setTranslation(fakePos, true)
  //   }
  // })

  let smallDif = .01 // .3+
  let dif = .1 // .3+
  useFrame((state) => {
    const velocity = ref.current.linvel()
    const distance = Math.hypot(fakePos.x-ref.current.translation().x, fakePos.z-ref.current.translation().z)
    if (distance < dif) {
      if (distance > smallDif) {
        // console.log('small teleporting', distance)
        ref.current.setTranslation(fakePos, true)
      } 
    } else if (distance > dif) {
      // console.log('giving velocity', SPEED*distance)
      if (fakePos.z-ref.current.translation().z > 0) { // down
        frontVector.set(0, 0, 1)
      } else { // up
        frontVector.set(0, 0, -1)
      }
      if (fakePos.x-ref.current.translation().x > 0) { // right
        sideVector.set(-1, 0, 0)
      } else { // left
        sideVector.set(1, 0, 0)
      }
      direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED)
      ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    } else if (distance > 10) { // should teleport
      // console.log('big teleporting', distance)
      ref.current.setTranslation(fakePos, true)
    }
  })

  const ref = useRef()
  return (
    <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[10, 5, 0]} enabledRotations={[false, false, false]}>
    <CuboidCollider args={[.5, 1.5, .5]} />
    <mesh receiveShadow castShadow>
      <boxGeometry args={[1, 3, 1]} scale={10} />
      <meshStandardMaterial color="red" transparent opacity={.5} />
    </mesh>
  </RigidBody>
  )
}
