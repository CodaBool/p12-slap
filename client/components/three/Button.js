import { setState, useEffect, useState } from 'react'
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

export default function Button({ position, action, color, players }) {
  const [show, setShow] = useState()
  // const onClick = useCallback((e) => {
  //   action()
  //   e.stopPropagation()
  // }, [])

  useEffect(() => {
    if (!players) return
    let foundATurn = false
    for (const p of players) {
      if (p.turn) {
        foundATurn = true
        setShow(false)
      }
    }
    if (!foundATurn) setShow(true)
  }, [players])

  if (!show) return

  return (
    <mesh 
      position={position} 
      scale={.1} 
      rotation={[-Math.PI/2, 0, 0]} 
      onClick={action}
    >
      <sphereGeometry args={[1, 28, 14, 0, Math.PI, 0, Math.PI]} />
      <meshStandardMaterial color={color}  />
    </mesh>
  )
}
