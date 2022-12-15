import { setState, useEffect, useCallback } from 'react'
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

export default function Button({ position, action, color }) {
  // const onClick = useCallback((e) => {
  //   action()
  //   e.stopPropagation()
  // }, [])

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
