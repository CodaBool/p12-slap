import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState, useMemo } from "react"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import {  useRapier, CapsuleCollider, CuboidCollider, RigidBody, quat, euler  } from "@react-three/rapier"
import * as THREE from "three"
// import * as RAPIER from "@dimforge/rapier3d-compat"
import { socket } from '../../constants'
import { uid } from '../../pages'
import { players } from '../../pages/game'
import Chairs from './Chair'
import { SkeletonUtils } from "three-stdlib"

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

useGLTF.preload("/player.glb")

function OtherPlayer({ scene, position, color, body }) {
  useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.material.color = new THREE.Color(color)
        obj.frustumCulled = false // disable mesh disapear when close
        obj.material = obj.material.clone()
      }
    })
  }, [])

  return (
    <RigidBody
      position={position}
      colliders={false}
      ref={body}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, false, true]}
      type="dynamic"
      scale={2}
      mass={10}
    >
      <primitive object={scene} />
      <CuboidCollider args={[.32, .85, .32]} position={[0, .83, 0]} />
    </RigidBody>
  )
}

let order = 0
let lastAnimation = ['Idle', 'Idle', 'Idle', 'Idle']
let myAnimation = 'Idle'
let cameraRotation = 0
let locked = false
let vector = new THREE.Vector3()

export default function PlayerV2({ gameLoop, slap }) {
  const [, get] = useKeyboardControls()
  const [currentChair, setCurrentChair] = useState()
  const [lastPos, setLastPos] = useState([8,0,0])
  const { animations, scene:object } = useGLTF("/player.glb")
  const myBody = useRef(null)
  const body1 = useRef()
  const body2 = useRef()
  const body3 = useRef()
  const body4 = useRef()
  // const rapier = useRapier()
  const { camera } = useThree()
  const scene1 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene2 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene3 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene4 = useMemo(() => SkeletonUtils.clone(object), [object])
  const { actions:actions1 } = useAnimations(animations, scene1)
  const { actions:actions2 } = useAnimations(animations, scene2)
  const { actions:actions3 } = useAnimations(animations, scene3)
  const { actions:actions4 } = useAnimations(animations, scene4)
  
  useEffect(() => {
    // MOUNT
    camera.rotation.set(0, Math.PI /2, 0)
    actions1['Idle'].play()
    actions2['Idle'].play()
    actions3['Idle'].play()
    actions4['Idle'].play()

    // SOCKETS
    socket.on('chair', data => {
      changeOtherChair(data[0], data[1], data[2])
    })

    socket.on('animation', data => {
      // order, action
      // const [a, sc, act] = getRefFromOrder(data[1])
      // console.log('play', data[0])
      // TODO: dry this
      if (data[1] === 1) {
        actions1['Slap'].stop()
        actions1['Sit'].stop()
        actions1['Idle'].stop()
        actions1['Run'].stop()
        actions1['Walk'].stop()
        lastAnimation[0] = data[0]
        if (data[0] === 'Slap') {
          actions1['Sit'].play()
          actions1['Slap'].fadeIn(.1).play()
          setTimeout(() => {
            actions1['Slap'].fadeOut(.3).play()
          }, 150)
        } else {
          actions1[data[0]].play()
        }
      } else if (data[1] === 2) {
        actions2['Slap'].stop()
        actions2['Sit'].stop()
        actions2['Idle'].stop()
        actions2['Run'].stop()
        actions2['Walk'].stop()
        lastAnimation[1] = data[0]
        if (data[0] === 'Slap') {
          actions2['Sit'].play()
          actions2['Slap'].stop().fadeIn(.1).play()
          setTimeout(() => {
            actions2['Slap'].fadeOut(.3).play()
          }, 150)
        } else {
          actions2[data[0]].play()
        }
      } else if (data[1] === 3) {
        actions3['Slap'].stop()
        actions3['Sit'].stop()
        actions3['Idle'].stop()
        actions3['Run'].stop()
        actions3['Walk'].stop()
        lastAnimation[2] = data[0]
        if (data[0] === 'Slap') {
          actions3['Sit'].play()
          actions3['Slap'].stop().fadeIn(.1).play()
          setTimeout(() => {
            actions3['Slap'].fadeOut(.3).play()
          }, 150)
        } else {
          actions3[data[0]].play()
        }
      } else if (data[1] === 4) {
        actions4['Slap'].stop()
        actions4['Sit'].stop()
        actions4['Idle'].stop()
        actions4['Run'].stop()
        actions4['Walk'].stop()
        lastAnimation[3] = data[0]
        if (data[0] === 'Slap') {
          actions4['Sit'].play()
          actions4['Slap'].stop().fadeIn(.1).play()
          setTimeout(() => {
            actions4['Slap'].fadeOut(.3).play()
          }, 150)
        } else {
          actions4[data[0]].play()
        }
      }
    })

    socket.on('move', data => {
      // const [a, b, act] = getRefFromOrder(data[1])
      if (data[4] === 1) {
        body1.current.setTranslation({ x: data[0] / 100, y: .04, z: data[1] / 100 }, true)
        body1.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        scene1.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), data[2]/100)
      } else if (data[4] === 2) {
        body2.current.setTranslation({ x: data[0] / 100, y: .04, z: data[1] / 100 }, true)
        body2.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        scene2.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), data[2]/100)
      } else if (data[4] === 3) {
        body3.current.setTranslation({ x: data[0] / 100, y: .04, z: data[1] / 100 }, true)
        body3.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        scene3.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), data[2]/100)
      } else if (data[4] === 4) {
        body4.current.setTranslation({ x: data[0] / 100, y: .04, z: data[1] / 100 }, true)
        body4.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        scene4.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), data[2]/100)
      }
    })
    
    socket.on("leave", ioPlayer => {
      if (ioPlayer.order === 1) {
        body1.current.setTranslation({ x: 22, y: .04, z: 20 }, true)
        body1.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      } else if (ioPlayer.order === 2) {
        body2.current.setTranslation({ x: 26, y: .04, z: 20 }, true)
        body2.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      } else if (ioPlayer.order === 3) {
        body3.current.setTranslation({ x: 30, y: .04, z: 20 }, true)
        body3.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      } else if (ioPlayer.order === 4) {
        body4.current.setTranslation({ x: 34, y: .04, z: 20 }, true)
        body4.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      }
    })

    return () => {
      socket.off('animation')
      socket.off('chair')
      socket.off('leave')
      socket.off('move')
    }
  }, [])

  useEffect(() => {
    if (!players?.length || order) return
    for (const p of players) {
      if (p.uid === uid) {
        order = p.order
        if (order === 1) {
          myBody.current.setTranslation({ x: 4, y: .04, z: 5 }, true)
        } else if (order === 2) {
          myBody.current.setTranslation({ x: -6, y: .04, z: 5 }, true)
        } else if (order === 3) {
          myBody.current.setTranslation({ x: 8, y: .04, z: -5 }, true)
        } else if (order === 4) {
          myBody.current.setTranslation({ x: -10, y: .04, z: -5 }, true)
        }
      } else {
        if (p.order === 1) {
          body1.current.setTranslation({ x: 4, y: .04, z: 5 }, true)
        } else if (p.order === 2) {
          body2.current.setTranslation({ x: -6, y: .04, z: 5 }, true)
        } else if (p.order === 3) {
          body3.current.setTranslation({ x: 8, y: .04, z: -5 }, true)
        } else if (p.order === 4) {
          body4.current.setTranslation({ x: -10, y: .04, z: -5 }, true)
        }
      }
    }
  }, [players])

  useEffect(() => {
    const interval = setInterval(() => {
      if (locked || !myBody.current) return
      camera.getWorldDirection( vector )
      cameraRotation = (Math.atan2(vector.z,vector.x)+1.6) * (-1)
      if (Math.abs(lastPos[0] - myBody.current.translation().x) > .5 || Math.abs(lastPos[1] - myBody.current.translation().z) > .5 || Math.floor(cameraRotation) !== lastPos[2]) {
        setLastPos([myBody.current.translation().x, myBody.current.translation().z, Math.floor(cameraRotation)])
        // using int8 in backend means this can be max -128 to 127
        // using int16 in backend means this can be max -32,768 to 32,767
        // int16 seems to make sense
        socket.emit('move', [Math.floor(myBody.current.translation().x * 100), Math.floor(myBody.current.translation().z * 100), Math.floor(cameraRotation*100), uid, order])
      }
    }, 100)
    return () => clearInterval(interval)
  }, [lastPos, locked])

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
      if (locked && order > 0) {
        // TODO: only do this when looking at table
        slap()
        socket.emit('animation', ['Slap', order])
      }
    }
  }

  function getRefFromOrder(order) {
    if (order === 1) {
      return [body1?.current, scene1, actions1]
    } else if (order === 2) {
      return [body2?.current, scene2, actions2]
    } else if (order === 3) {
      return [body3?.current, scene3, actions3]
    } else if (order === 4) {
      return [body4?.current, scene4, actions4]
    }
  }

  function changeOtherChair(desiredState, chair, order) {
    const [hitbox, model, act] = getRefFromOrder(order)
    if (!hitbox || !model || !act) {
      console.error('failed to get props for player', order)
      return
    }
    if (desiredState === 'sit') {
      if (chair === 1) {
        hitbox.setTranslation({ x: 0, y: .2, z: 2.8 }, true)
        hitbox.lockTranslations(true, true)
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.03)
      } else if (chair === 2) {
        hitbox.setTranslation({ x: 0, y: .2, z: -2.8 }, true)
        hitbox.lockTranslations(true, true)
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -3.17)
      } else if (chair === 3) {
        hitbox.setTranslation({ x: -2.8, y: .2, z: 0 }, true)
        hitbox.lockTranslations(true, true)
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -1.6)
      } else if (chair === 4) {
        hitbox.setTranslation({ x: 2.8, y: .2, z: 0 }, true)
        hitbox.lockTranslations(true, true)
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), 1.6)
      }
    } else {
      if (chair === 1) {
        hitbox.setTranslation({ x: 1.8, y: -.5, z: 2.8 }, true)
        hitbox.lockTranslations(false, true)
        hitbox.setEnabledTranslations(true, true, true, true)
      } else if (chair === 2) {
        hitbox.setTranslation({ x: -2.8, y: -.5, z: -2.8 }, true)
        hitbox.lockTranslations(false, true)
        hitbox.setEnabledTranslations(true, true, true, true)
      } else if (chair === 3) {
        hitbox.setTranslation({ x: -2.8, y: -.5, z: 2.8 }, true)
        hitbox.lockTranslations(false, true)
        hitbox.setEnabledTranslations(true, true, true, true)
      } else if (chair === 4) {
        hitbox.setTranslation({ x: 2.8, y: -.5, z: -2 }, true)
        hitbox.lockTranslations(false, true)
        hitbox.setEnabledTranslations(true, true, true, true)
      }
    }
  }

  function changeMyChair(desiredState, chair, order) {
    // console.log('change chair', locked, 'chair', chair, 'order', order)
    if (!chair || order === 0) {
      console.error('reset')
      myBody.current.setTranslation({ x: 2.8, y: -.5, z: 0 }, true)
      myBody.current.lockTranslations(false, true)
      myBody.current.setEnabledTranslations(true, true, true, true)
      locked = false
      return
    }
    if (desiredState === 'sit') {
      if (chair === 4) {
        myBody.current.setTranslation({ x: 2.8, y: 0, z: 0 }, true)
        // camera.position.set(2.8, 3.8, 0)
        // camera.rotation.set(-1.5737, 0.96879, 1.57432)
        camera.position.set(0, 6, 1)
        camera.rotation.set(-1.4, 0, 0)
      } else if (chair === 3) {
        myBody.current.setTranslation({ x: -2.8, y: 0, z: 0 }, true)
        // camera.position.set(-2.8, 3.8, 0)
        // camera.rotation.set(-1.5707, -0.9547, -1.5707)
        camera.position.set(0, 6, 1)
        camera.rotation.set(-1.4, 0, 0)
      } else if (chair === 2) {
        myBody.current.setTranslation({ x: 0, y: 0, z: -2.8 }, true)
        // camera.position.set(0, 3.8, -2.8)
        // camera.rotation.set(.6, Math.PI, 0)
        camera.position.set(0, 6, 1)
        camera.rotation.set(-1.4, 0, 0)
      } else if (chair === 1) {
        myBody.current.setTranslation({ x: 0, y: 0, z: 2.8 }, true)
        camera.position.set(0, 6, 1)
        camera.rotation.set(-1.4, 0, 0)
      }
      setCurrentChair(chair)
      myAnimation = 'Sit'
      // socket.emit('animation', ['Sit', order])
      socket.emit('chair', ['sit', chair, order])
      myBody.current.lockTranslations(true, true)
      locked = true
    } else {
      if (chair === 4) {
        myBody.current.setTranslation({ x: 2.8, y: -.5, z: -2 }, true)
      } else if (chair === 3) {
        myBody.current.setTranslation({ x: -2.8, y: -.5, z: 2.8 }, true)
      } else if (chair === 2) {
        myBody.current.setTranslation({ x: -2.8, y: -.5, z: -2.8 }, true)
      } else if (chair === 1) {
        myBody.current.setTranslation({ x: 1.8, y: -.5, z: 2.8 }, true)
      }
      setCurrentChair(null)
      myAnimation = 'Idle'
      // socket.emit('animation', ['Idle', order])
      myBody.current.lockTranslations(false, true)
      myBody.current.setEnabledTranslations(true, true, true, true)
      socket.emit('chair', ['stand', chair, order])
      locked = false
    }
  }

  function handleChairClick(e, id) {
    if (e.button === 2) {
      if (locked) return
      changeMyChair('sit', Number(id), Number(order))
    }
  }

  function mouseEvent(e) {
    if (e.buttons === 2) { // RMB
      if (!locked || !currentChair) return
      changeMyChair('stand', currentChair, Number(order))
    } else if (e.buttons === 1) { // LMB
      if (locked) {
        if (players.find(p => p.turn)) {
          socket.emit('animation', ['Slap', order])
          gameLoop()
        } else {
          console.log('THIS STILL WORKS')
        }
      }
    }
  }
  
  let latestAnim
  useFrame((state, delta) => {
    if (locked || !myBody?.current) return
    const { forward, backward, left, right, jump, run } = get()
    // const velocity = myBody.current.linvel()
    if (forward || backward || left || right) {
      if (run) {
        latestAnim = 'Run'
      } else {
        latestAnim = 'Walk'
      }
    } else {
      latestAnim = 'Idle'
    }

    if (latestAnim !== myAnimation) {
      myAnimation = latestAnim
      socket.emit('animation', [latestAnim, order])
    }
    // if (jump) action = "TPost"

    // if (actionRef.current != action) {
    //   const nextActionToPlay = actions[action];
    //   const current = actions[actionRef.current];
    //   current?.fadeOut(0.2);
    //   nextActionToPlay?.reset().fadeIn(0.2).play();
    //   actionRef.current = action;
    // }

    // camera.position.set(myBody.current.translation().x-4, myBody.current.translation().y+10, myBody.current.translation().z-4)
    camera.position.set(myBody.current.translation().x, myBody.current.translation().y+3.3, myBody.current.translation().z)
    // camera.position.set(10, 2, 0)
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)
    // console.log(direction.x, velocity.y, direction.z)
    // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
    // console.log('rigid', { x: direction.x, y: velocity.y, z: direction.z })
    myBody.current.setLinvel({x: direction.x, y: 0, z: direction.z}, true)
    // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // jumping
    // const ray = rapier.world.raw().castRay(new RAPIER.Ray(body.current.translation(), { x: 0, y: -1, z: 0 }))
    // if (jump && ray && ray.collider && Math.abs(ray.toi) <= 1.75) body.current.setLinvel({ x: 0, y: 3, z: 0 })
  })

  return (
    <>
      <RigidBody
        ref={myBody}
        position={[20, .04, 20]}
        colliders={false}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, false, true]}
        type="dynamic"
        scale={2}
        mass={10}
      >
        {/* <primitive object={myScene} ref={primRef} /> */}
        <CuboidCollider args={[.32, .85, .32]} position={[0, .83, 0]} />
      </RigidBody>
      <OtherPlayer position={[22,.04,20]} body={body1} color="rgb(138, 138, 254)" scene={scene1} />
      <OtherPlayer position={[26,.04,20]} body={body2} color="rgb(201, 104, 104)" scene={scene2} />
      <OtherPlayer position={[30,.04,20]} body={body3} color="rgb(99, 152, 213)" scene={scene3} />
      <OtherPlayer position={[34,.04,20]} body={body4} color="rgb(254, 225, 137)" scene={scene4} />
      <Chairs h={handleChairClick} />
    </>
  )
}