import { useEffect, useState } from 'react'

export default function Button({ position, action, color, players }) {
  const [show, setShow] = useState()

  useEffect(() => {
    if (players?.find(p => p.turn)) {
      setShow(false)
    } else {
      setShow(true)
    }
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