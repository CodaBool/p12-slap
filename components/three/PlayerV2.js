
// import React, { useRef } from "react"
// import { useGLTF, useAnimations, useKeyboardControls } from "@react-three/drei"
// import { useFrame, useThree } from "@react-three/fiber"
// import { RigidBody, useRapier, CuboidCollider } from "@react-three/rapier"
// import * as THREE from 'three';
// import * as RAPIER from "@dimforge/rapier3d-compat"

// const SPEED = 5
// const direction = new THREE.Vector3()
// const frontVector = new THREE.Vector3()
// const sideVector = new THREE.Vector3()

// export default function PlayerV2(props) {
//   const group = useRef();
//   const body = useRef();
//   const currentAction = useRef()
//   const { nodes, materials, animations } = useGLTF("/assets/soldier.glb")
//   const { actions } = useAnimations(animations, group)
//   const rapier = useRapier()
//   const { scene, camera } = useThree()

//   // Idle, Run, TPost, Walk

//   const [, get] = useKeyboardControls();
//   // const { forward, backward, left, right, jump, shift } = get()
  
//   // animation 1
//   // useFrame((state, delta) => {
//   //   const { forward, backward, left, right, jump, shift } = get();
//   //   let action = "";
//   //   if (forward || backward || left || right) {
//   //     action = "Walk";
//   //     if (shift) {
//   //       action = "Run";
//   //     }
//   //   } else {
//   //     action = "Idle";
//   //   }

//     // if (currentAction.current != action) {
//     //   const nextActionToPlay = actions[action];
//     //   const current = actions[currentAction.current];
//     //   current?.fadeOut(0.2);
//     //   nextActionToPlay?.reset().fadeIn(0.2).play();
//     //   currentAction.current = action;
//     // }

//   //   const impulse = { x: 0, y: 0, z: 0 };

//   //   const impulseStrength = 1 * delta;
//   //   if (forward) {
//   //     impulse.z -= impulseStrength;
//   //   }

//   //   body.current.applyImpulse(impulse);
//   // });

//   // animation2
//   // let action = ""
//   // useFrame((state, delta) => {
//   //   if (!body?.current) return
//   //   // let currentPos = body.current.translation();
//   //   // let currentDirect = body.current.rotation();
//   //   const { forward, backward, left, right, space, shift, run } = get()

//   //   if (forward || backward || left || right) {
//   //     if (run) {
//   //       action = "Run"
//   //     } else {
//   //       action = "Walk"
//   //     }
//   //   } else {
//   //     action = "Idle"
//   //   }

//   //   if (currentAction.current != action) {
//   //     const nextActionToPlay = actions[action];
//   //     const current = actions[currentAction.current];
//   //     current?.fadeOut(0.2);
//   //     nextActionToPlay?.reset().fadeIn(0.2).play();
//   //     currentAction.current = action;
//   //   }

//   //   const impulse = { x: 0, y: 0, z: 0 };

//   //   const impulseStrength = 1 * delta;
//   //   if (forward) {
//   //     impulse.z -= impulseStrength;
//   //   }

//   //   body.current.applyImpulse(impulse);
//   // })

//   // animation3
//   let action = ""
//   useFrame((state, delta) => {
//     const { forward, backward, left, right, run, jump } = get()


//     if (forward || backward || left || right) {
//       if (run) {
//         action = "Run"
//       } else {
//         action = "Walk"
//       }
//     } else {
//       action = "Idle"
//     }

//     if (currentAction.current != action) {
//       const nextActionToPlay = actions[action];
//       const current = actions[currentAction.current];
//       current?.fadeOut(0.2);
//       nextActionToPlay?.reset().fadeIn(0.2).play();
//       currentAction.current = action;
//     }

//     const velocity = body.current.linvel()
//     // update camera
    
//     camera.position.set(body.current.translation().x + 6, body.current.translation().y  +6, body.current.translation().z )
//     frontVector.set(0, 0, backward - forward)
//     sideVector.set(left - right, 0, 0)
//     // console.log(ref.current.position.x, ref.current.position.y + 2.5, ref.current.position.z)
//     direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)

//     // console.log('set', direction.x, velocity.current[1], direction.z)
//     // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
//     body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
//     // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
//     // // jumping
//     const ray = rapier.world.raw().castRay(new RAPIER.Ray(body.current.translation(), { x: 0, y: -1, z: 0 }))
//     if (jump && ray && ray.collider && Math.abs(ray.toi) <= 1.75) body.current.setLinvel({ x: 0, y: 3, z: 0 })
//   })

//   return (
//     <group ref={group} dispose={null}>
//       <RigidBody ref={body} colliders={false} position={[10, 1, 0]} scale={0.02} rotation={[-Math.PI / 2, 0, 0]}>
//         <skinnedMesh
//           name="vanguard_Mesh"
//           geometry={nodes.vanguard_Mesh.geometry}
//           material={materials.VanguardBodyMat}
//           skeleton={nodes.vanguard_Mesh.skeleton}
//         />
//         <skinnedMesh
//           name="vanguard_visor"
//           geometry={nodes.vanguard_visor.geometry}
//           material={materials.Vanguard_VisorMat}
//           skeleton={nodes.vanguard_visor.skeleton}
//         />
//         <primitive object={nodes.mixamorigHips} />
//         <CuboidCollider args={[.5, 1.5, .5]} />
//       </RigidBody>
//     </group>
//   );
//   // return (
//   //   <group ref={group} position={[0,5,0]} dispose={null} rotation={[-Math.PI / 2, 0, 0]} scale={0.01}>
      
//   //     <RigidBody ref={body} colliders={false} position={[10, 1, 0]} enabledRotations={[false, false, false]}>
//   //       <skinnedMesh
//   //         name="vanguard_Mesh"
//   //         geometry={nodes.vanguard_Mesh.geometry}
//   //         material={materials.VanguardBodyMat}
//   //         skeleton={nodes.vanguard_Mesh.skeleton}
//   //       />
//   //       <skinnedMesh
//   //         name="vanguard_visor"
//   //         geometry={nodes.vanguard_visor.geometry}
//   //         material={materials.Vanguard_VisorMat}
//   //         skeleton={nodes.vanguard_visor.skeleton}
//   //       />
//   //       <CuboidCollider args={[.5, 1.5, .5]} />
//   //     </RigidBody>
//   //   </group>
//   // );
// }





import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, useRapier, CapsuleCollider, CuboidCollider } from "@react-three/rapier"
import * as THREE from "three"
// import * as RAPIER from "@dimforge/rapier3d-compat"
import { socket } from '../../constants'
import { useStore, uid, stack } from '../../pages'
import Chairs from './Chair'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

useGLTF.preload("/assets/player.glb")

export default function PlayerV2({ gameLoop, slap, players }) {
  const [, get] = useKeyboardControls()
  const [locked, setLocked] = useState(false)
  const [currentChair, setCurrentChair] = useState()
  const { nodes, materials, animations, scene:object } = useGLTF("/assets/player.glb")
  const { actions } = useAnimations(animations, object)
  const actionRef = useRef()
  const body = useRef()
  // const rapier = useRapier()
  const { scene, camera } = useThree()

  useEffect(() => {
    camera.rotation.set(0, Math.PI /2, 0)
    // console.log('actions', actions)
    // const action = 'Sit'
    // const nextActionToPlay = actions[action]
    // nextActionToPlay?.reset().fadeIn(0.2).play()
  }, [])

  useEffect(() => {
    socket.on('sit', data => {
      console.log('someone else sate', data)
    })
    return () => {
      socket.off('sit')
    }
  }, [body, actions, stack])

  useEffect(() => {
    window.addEventListener("mousedown", mouseEvent)
    window.addEventListener("keydown", keyEvent)
    return () => {
      window.removeEventListener("mousedown", mouseEvent)
      window.removeEventListener("keydown", keyEvent)
    }
  }, [mouseEvent, keyEvent, locked, currentChair])

  function keyEvent(e) {
    if (e.key === " ") {
      if (locked) slap()
    }
  }

  function changeChair(desiredState, chair) {
    let devOffset = 0
    if (true) {
      devOffset = 3
    }
    if (!chair) {
      console.log('reset')
      body.current.setTranslation({ x: 2.8, y: 0, z: 0 }, true)
      body.current.setRotation({ w: 1, x: 0, y: Math.PI/3, z: 0 }, true)
      socket.emit('stand', 1)
      setLocked(false)
      body.current.lockTranslations(false, true)
      body.current.setEnabledTranslations(true, true, true, true)
      return
    }
    if (desiredState === 'sit') {
      // console.log('sitting in chair', chair)
      if (chair == 4) {
        body.current.setTranslation({ x: 2.8, y: 0, z: 0 }, true)
        body.current.setRotation({ w: 1, x: 0, y: Math.PI/3, z: 0 }, true)
        camera.position.set(2.8+devOffset, 3.8+devOffset, 0)
        camera.rotation.set(0, Math.PI/2, 0)
      } else if (chair == 3) {
        body.current.setTranslation({ x: -2.8, y: 0, z: 0 }, true)
        body.current.setRotation({ w: 1, x: 0, y: -Math.PI/3, z: 0 }, true)
        camera.position.set(-2.8, 3.8+devOffset, 0+devOffset)
        camera.rotation.set(0, -Math.PI/2, 0)
      } else if (chair == 2) {
        body.current.setTranslation({ x: 0, y: 0, z: -2.8 }, true)
        body.current.setRotation({ w: 1, x: 0, y: 1, z: 0 }, true)
        camera.position.set(0, 3.8+devOffset, -2.8+devOffset)
        camera.rotation.set(.6, Math.PI, 0)
      } else if (chair == 1) {
        body.current.setTranslation({ x: 0, y: 0, z: 2.8 }, true)
        body.current.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true)
        camera.position.set(0, 3.8+devOffset, 2.8+devOffset)
        camera.rotation.set(-.6, 0, 0)
      }
      setCurrentChair(chair)
      setLocked(true)
      socket.emit('sit', chair)
      body.current.lockTranslations(true, true)
    } else {
      // console.log('standing from chair', chair)
      if (chair == 4) {
        body.current.setTranslation({ x: 2.8, y: 0, z: -2 }, true)
      } else if (chair == 3) {
        body.current.setTranslation({ x: -2.8, y: 0, z: 2.8 }, true)
      } else if (chair == 2) {
        body.current.setTranslation({ x: -2.8, y: 0, z: -2.8 }, true)
      } else if (chair == 1) {
        body.current.setTranslation({ x: 1.8, y: 0, z: 2.8 }, true)
      }
      setCurrentChair(null)
      setLocked(false)
      body.current.lockTranslations(false, true)
      body.current.setEnabledTranslations(true, true, true, true)
      socket.emit('stand', chair)
    }
  }

  function handleChairClick(e, id) {
    if (e.button == 2) {
      if (locked) return
      changeChair('sit', id)
    }
  }

  function mouseEvent(e) {
    if (e.buttons === 2) { // RMB
      // console.log('RMB | locked =', locked, currentChair)
      if (!locked) return
      changeChair('stand', currentChair)
      // let size = 0
      // stack.forEach(() => size++)
      // camera.position.set(0, 3.7 + (size * .05), .7)
      // camera.rotation.set(-Math.PI /2.5, 0, 0)
    } else if (e.buttons === 1) { // LMB
      const action = 'Sit'
      const nextActionToPlay = actions[action]
      nextActionToPlay?.reset().fadeIn(0.2).play()
      if (locked) {
        gameLoop()
      }
    }
  }

  let action = ""
  let lastAngle = null
  let currentAngle = null
  // let currentDirect = body.current.rotation()
  useFrame((state, delta) => {
    if (locked) return
    const { forward, backward, left, right, jump, run } = get()
    const velocity = body.current.linvel()
    if (forward || backward || left || right) {
      if (run) {
        action = "Run";
      } else {
        action = "Walk";
      }
    } else {
      action = "Idle";
    }
    // if (jump) action = "TPost"

    if (actionRef.current != action) {
      // const nextActionToPlay = actions[action];
      // const current = actions[actionRef.current];
      // current?.fadeOut(0.2);
      // nextActionToPlay?.reset().fadeIn(0.2).play();
      // actionRef.current = action;
    }

    // camera.position.set(body.current.translation().x+4, body.current.translation().y+6, body.current.translation().z+4)
    camera.position.set(body.current.translation().x, body.current.translation().y+3.8, body.current.translation().z)
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    // console.log(ref.current.position.x, ref.current.position.y + 2.5, ref.current.position.z)
    // direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)

    // console.log('set', direction.x, velocity.current[1], direction.z)
    // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
    body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // jumping
    // const ray = rapier.world.raw().castRay(new RAPIER.Ray(body.current.translation(), { x: 0, y: -1, z: 0 }))
    // if (jump && ray && ray.collider && Math.abs(ray.toi) <= 1.75) body.current.setLinvel({ x: 0, y: 3, z: 0 })
    
    if (.24 < camera.rotation._z && camera.rotation._z < 2.9) {
      currentAngle = Math.PI/2
    } else if (-2.9 < camera.rotation._z && camera.rotation._z > 2.9) {
      currentAngle = Math.PI
    } else if (-.24 < camera.rotation._z && camera.rotation._z < .24) {
      currentAngle = -Math.PI*2
    } else if (-.24 > camera.rotation._z && camera.rotation._z < -2.9) {
      currentAngle = -Math.PI/2
    }
    if (currentAngle !== lastAngle) {
      lastAngle = currentAngle
      body?.current?.setRotation(body?.current?.rotation().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle))
    }
  });

  return (
    <>
      <RigidBody
        ref={body}
        position={[8, 5, 0]}
        colliders={false}
        enabledRotations={[false, false, false]}
        scale={2}
        mass={10}
      >
        <primitive object={object} />
        {/* [height, diameter] */}
        {/* <CapsuleCollider args={[.8,.33]} position={[0, 1.1, 0]} /> */}
        <CuboidCollider args={[.32, .85, .32]} position={[0, 1, 0]} />
      </RigidBody>
      <Chairs h={handleChairClick} />
    </>
  );
}



// // single
// if (forward && !left && !right) {
//   currentAngle = Math.PI / 2
// } else if (backward && !left && !right) {
//   currentAngle = -Math.PI / 2
// } else if (left && !forward && !backward) {
//   currentAngle = Math.PI
// } else if (right && !forward && !backward) {
//   currentAngle = -Math.PI * 2
// }

// // combo
// if (forward && left) {
//   currentAngle = Math.PI - (Math.PI / 4)
// } else if (forward && right) {
//   currentAngle = Math.PI / 4
// } else if (backward && left) {
//   currentAngle = -Math.PI + (Math.PI / 4)
// } else if (backward && right) {
//   currentAngle = -Math.PI / 4
// }

// if (currentAngle !== lastAngle) {

//   // lastAngle = currentAngle
//   // body?.current?.setRotation(body?.current?.rotation().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle))
// }