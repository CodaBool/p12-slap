import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState, useMemo } from "react"
import { useKeyboardControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, useRapier, CapsuleCollider, CuboidCollider } from "@react-three/rapier"
import * as THREE from "three"
// import * as RAPIER from "@dimforge/rapier3d-compat"
import { socket } from '../../constants'
import { useStore, uid, stack } from '../../pages'
import Chairs from './Chair'
import { SkeletonUtils } from "three-stdlib"

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

useGLTF.preload("/assets/player.glb")

function OtherPlayer({ scene, position, color, id, animations, players }) {
  const { actions } = useAnimations(animations, scene)
  const [animate, setAnimate] = useState('Idle')
  const body = useRef()
  const direction = new THREE.Vector3()
  const frontVector = new THREE.Vector3()
  const sideVector = new THREE.Vector3()
  const SPEED = 5
  let pos = {x:position[0], y:position[1], z:position[2]}

  useEffect(() => {
    actions[animate].reset().fadeIn(0.1).play()
    return () => {
      actions[animate].fadeOut(0.5)
    }
  }, [animate])

  useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.material.color = new THREE.Color(color)
        obj.frustumCulled = false // disable mesh disapear when close
        obj.material = obj.material.clone()
      }
    })

    socket.on('move', data => {
      console.log('move data', data)
      // console.log('convert to float', data/100)
      // for (const i in players) {
      //   if (i == id) {
      //     pos.x = data.x
      //     pos.z = data.z
      //   }
      // }
      // pos = {x: data.cord.x, y: data.cord.y, z: data.cord.z}
    })
    return () => socket.off('move')
  }, [])

  let smallDif = .01 // .3+
  let dif = .1 // .3+
  useFrame(() => {
    const distance = Math.hypot(pos.x-body.current.translation().x, pos.z-body.current.translation().z)
    const velocity = body.current.linvel()
    // if (id==1) console.log(id, 'distance', distance)
    if (distance < dif) {
      if (distance > smallDif) {
        // console.log(id, 'small teleporting', distance)
        body.current.setTranslation(pos, true)
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
      } 
    } else if (distance > dif) {
      // console.log(id, 'giving velocity', SPEED*distance)
      if (pos.z-body.current.translation().z > 0) { // down
        frontVector.set(0, 0, 1)
      } else { // up
        frontVector.set(0, 0, -1)
      }
      if (pos.x-body.current.translation().x > 0) { // right
        sideVector.set(-1, 0, 0)
      } else { // left
        sideVector.set(1, 0, 0)
      }
      direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED)
      body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    } else if (distance > 10) { // should teleport
      // console.log(id, 'big teleporting', distance)
      body.current.setTranslation(pos, true)
      body.current.setLinvel({ x: 0, y: 0, z: 0 })
    }
  })

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

export default function PlayerV2({ gameLoop, slap, players }) {
  const [, get] = useKeyboardControls()
  const [locked, setLocked] = useState(false)
  const [currentChair, setCurrentChair] = useState()
  const [animate, setAnimate] = useState('Idle')
  const { nodes, materials, animations, scene:object } = useGLTF("/assets/player.glb")
  const body = useRef()
  // const rapier = useRapier()
  const { scene, camera } = useThree()
  const scene1 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene2 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene3 = useMemo(() => SkeletonUtils.clone(object), [object])
  const scene4 = useMemo(() => SkeletonUtils.clone(object), [object])
  const { actions } = useAnimations(animations, scene1)
  const [lastPos, setLastPos] = useState([8,0])

  useEffect(() => {
    // MOUNT
    camera.rotation.set(0, Math.PI /2, 0)
    scene1.traverse(obj => {
      if (obj.isMesh) {
        obj.material.color = new THREE.Color("rgb(254, 225, 137)")
        // obj.frustumCulled = false // disable mesh disapear when close
        obj.material = obj.material.clone()
      }
    })

    // SOCKETS
    socket.on('sit', data => {
      console.log('someone else sate', data)
    })

    return () => {
      socket.off('sit')
      socket.off('move')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.abs(lastPos[0] - body.current.translation().x) > .5 || Math.abs(lastPos[1] - body.current.translation().z) > .5) {
        console.log('sending', [Math.floor(body.current.translation().x * 100), Math.floor(body.current.translation().z * 100), uid])
        setLastPos([body.current.translation().x, body.current.translation().z])
        // using int8 in backend means this can be max -128 to 127
        // using int16 in backend means this can be max -32,768 to 32,767
        // seems like no matter what a float64 will be sent over
        socket.emit('move', [Math.floor(body.current.translation().x * 100), Math.floor(body.current.translation().z * 100), uid])
      }
    }, 100)
    return () => clearInterval(interval)
  }, [lastPos])

  useEffect(() => {
    actions[animate].reset().fadeIn(0.1).play()
    return () => {
      actions[animate].fadeOut(0.5)
    }
  }, [animate])

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
    if (false) {
      devOffset = 3
    }
    if (!chair) {
      console.log('reset')
      body.current.setTranslation({ x: 2.8, y: -.5, z: 0 }, true)
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
        // camera.rotation.set(-1.5, Math.PI/2, 1.5)
        camera.rotation.set(-1.5737, 0.96879, 1.57432)
      } else if (chair == 3) {
        body.current.setTranslation({ x: -2.8, y: 0, z: 0 }, true)
        body.current.setRotation({ w: 1, x: 0, y: -Math.PI/3, z: 0 }, true)
        camera.position.set(-2.8, 3.8+devOffset, 0+devOffset)
        // camera.rotation.set(0, -Math.PI/2, 0)
        camera.rotation.set(-1.5707, -0.9547, -1.5707)
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
      setAnimate('Sit')
      socket.emit('sit', chair)
      body.current.lockTranslations(true, true)
    } else {
      // console.log('standing from chair', chair)
      if (chair == 4) {
        body.current.setTranslation({ x: 2.8, y: -.5, z: -2 }, true)
      } else if (chair == 3) {
        body.current.setTranslation({ x: -2.8, y: -.5, z: 2.8 }, true)
      } else if (chair == 2) {
        body.current.setTranslation({ x: -2.8, y: -.5, z: -2.8 }, true)
      } else if (chair == 1) {
        body.current.setTranslation({ x: 1.8, y: -.5, z: 2.8 }, true)
      }
      setCurrentChair(null)
      setLocked(false)
      setAnimate('Idle')
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
      let size = 0
      stack.forEach(() => size++)
      camera.position.set(0, 3.7 + (size * .05), .7)
      camera.rotation.set(-Math.PI /2.5, 0, 0)
    } else if (e.buttons === 1) { // LMB
      if (locked) {
        setAnimate('Slap')
        // should this be debounced?
        setTimeout(() => {
          setAnimate('Sit')
        }, 500)
        gameLoop()
      }
    }
  }

  let lastAngle = null
  let currentAngle = null
  useFrame((state, delta) => {
    if (locked) return
    const { forward, backward, left, right, jump, run } = get()
    const velocity = body.current.linvel()
    if (forward || backward || left || right) {
      if (run) {
        setAnimate('Run')
      } else {
        setAnimate('Walk')
      }
    } else {
      setAnimate('Idle')
    }
    // if (jump) action = "TPost"

    // if (actionRef.current != action) {
    //   const nextActionToPlay = actions[action];
    //   const current = actions[actionRef.current];
    //   current?.fadeOut(0.2);
    //   nextActionToPlay?.reset().fadeIn(0.2).play();
    //   actionRef.current = action;
    // }

    // camera.position.set(body.current.translation().x-4, body.current.translation().y+10, body.current.translation().z-4)
    camera.position.set(body.current.translation().x, body.current.translation().y+3.2, body.current.translation().z)
    frontVector.set(0, 0, backward - forward)
    sideVector.set(left - right, 0, 0)
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(run?2*SPEED:SPEED).applyEuler(camera.rotation)

    // if (direction.x > 1 || velocity.current[1] > 1 || direction.z > 1)
    body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z })
    // jumping
    // const ray = rapier.world.raw().castRay(new RAPIER.Ray(body.current.translation(), { x: 0, y: -1, z: 0 }))
    // if (jump && ray && ray.collider && Math.abs(ray.toi) <= 1.75) body.current.setLinvel({ x: 0, y: 3, z: 0 })

    if (camera.rotation._y > 1) {
      currentAngle = Math.PI / 2
    } else if (camera.rotation._y < -1) {
      currentAngle = -Math.PI / 2
    } else if (Math.abs(camera.rotation._x) >= 3 || Math.abs(camera.rotation._z) >= 3) {
      currentAngle = Math.PI
    } else {
      currentAngle = -Math.PI * 2
    }

    if (currentAngle !== lastAngle) {
      lastAngle = currentAngle
      body?.current?.setRotation(body?.current?.rotation().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle))
    }
  })

  return (
    <>
      <RigidBody
        ref={body}
        position={[8, .04, 0]}
        colliders={false}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, false, true]}
        type="dynamic"
        scale={2}
        mass={10}
      >
        <primitive object={scene1} />
        <CuboidCollider args={[.32, .85, .32]} position={[0, .83, 0]} />
      </RigidBody>
      <OtherPlayer position={[5,.04,5]} color="rgb(138, 138, 254)" scene={scene2} animations={animations} players={players} id={1} />
      <OtherPlayer position={[7,.04,5]} color="rgb(201, 104, 104)" scene={scene3} animations={animations} players={players} id={2} />
      <OtherPlayer position={[9,.04,5]} color="rgb(99, 152, 213)" scene={scene4} animations={animations} players={players} id={3} />
      <Chairs h={handleChairClick} />
    </>
  );
}