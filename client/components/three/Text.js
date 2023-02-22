import { useState, useEffect, useRef } from "react"
import { TextGeometry } from "three-stdlib"
import roboto from "./font-roboto.json"
import { extend, useFrame } from "@react-three/fiber"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { useStore } from '../../pages/game'
import { uid } from '../../pages'

const font = new FontLoader().parse(roboto)
extend({ TextGeometry })

export default function Text({ text, position, rotation, scale, setText, players, spin }) {
  const [opacity, setOpacity] = useState(1)
  const ref = useRef()
  let timeout = null

  useEffect(() => {
    if (!text || !setText) return
    clearTimeout(timeout)
    timeout = setTimeout(() => setText(null), 3000)
  }, [text, setText])

  useEffect(() => {
    if (!players) return
    if (text == 'Start') {
      let foundATurn = false
      for (const p of players) {
        if (p.turn) {
          foundATurn = true
          setOpacity(0)
        }
      }
      if (!foundATurn) setOpacity(1)
    }
  }, [players])

  if (!text) return

  if (spin) {
    useFrame((_, delta) => ref.current.rotation.y -= delta)

    // useFrame((state, delta) => (ref.current.rotation.x += delta))

  }
  
  return (
    <mesh position={position} ref={ref} rotation={rotation} scale={scale}>
      <textGeometry args={[text, { font, size: .1, height: .02 }]} />
      <meshStandardMaterial attach='material' color='white' transparent opacity={opacity} />
    </mesh>
  )
}

export function CardInfo({ stack }) {
  const [text, setText] = useState()
     
  useEffect(() => {
    if (!stack) return
    let txt = ""
    for (const s of stack) {
      txt += s + '\n'
    }
    setText(txt)
  }, [stack])

  if (!text) return

  return (
    <mesh position={[2,4,0]} rotation={[0,0,0]}>
      <textGeometry args={[text, { font, size: .1, height: .02 }]} />
      <meshStandardMaterial attach='material' color='blue' />
    </mesh>
  )
}

export function Timer() {
  const [text, setText] = useState('5')
  const countdown = useStore(state => state.countdown)
  const setCountdown = useStore(state => state.setCountdown)

  useEffect(() => {
    if (countdown) {
      setText('5')
      setTimeout(() => setText('4'), 1000)
      setTimeout(() => setText('3'), 2000)
      setTimeout(() => setText('2'), 3000)
      setTimeout(() => setText('1'), 4000)
      setTimeout(() => {
        setCountdown(false)
        setText(null)
      }, 5000)
    } else {
      setText(null)
    }
  }, [countdown])

  if (!text) return

  return (
    <mesh position={[-.085 ,2,-1]} rotation={[-Math.PI /2,0,0]}>
      <textGeometry args={[text, { font, size: .2, height: .02 }]} />
      <meshStandardMaterial attach='material' color='red' />
    </mesh>
  )
}