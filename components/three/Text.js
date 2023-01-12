import { useState, useEffect } from "react"
import { TextGeometry } from "three-stdlib"
import roboto from "./font-roboto.json"
import { extend } from "@react-three/fiber"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { useStore, uid } from '../../pages'
import { debounce } from '../../constants'

const font = new FontLoader().parse(roboto)
extend({ TextGeometry })

export default function Text({ text, position, rotation, scale, setText, players }) {
  const [opacity, setOpacity] = useState(1)
  let timeout = null

  useEffect(() => {
    if (!text || !setText) return
    clearTimeout(timeout)
    timeout = setTimeout(() => setText(null), 3000)
  }, [text, setText])

  useEffect(() => {
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
  
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <textGeometry args={[text, { font, size: .1, height: .02 }]} />
      <meshStandardMaterial attach='material' color='white' transparent opacity={opacity} />
    </mesh>
  )
}

export function TurnText({ players }) {
  const [text, setText] = useState()
  const [color, setColor] = useState()
  // const status = useStore(state => state.status)

  useEffect(() => {
    // if (status == 'ready') {
    //   setText(null)
    //   return
    // }
    let foundATurn = false
    for (const p of players) {
      if (p.turn) foundATurn = true
      if (p.turn && p.name !== text) {
        if (p.uid === uid) {
          setText('Your Turn')
          setColor('green')
        } else {
          setText(p.name)
          setColor('red')
        }
      }
    }
    if (!foundATurn) setText(null)
  }, [players])

  if (!text) return

  return (
    <mesh position={[-.8, 2, -.9]} rotation={[-Math.PI /2,0,0]} scale={.3}>
      <textGeometry args={[text, { font, size: .1, height: .02,  }]} />
      <meshStandardMaterial attach='material' color={color} />
    </mesh>
  )
}

export function PlayerText({ players }) {
  const [otherNames, setOtherNames] = useState()
  const [myName, setMyName] = useState()

  useEffect(() => {
    let foundATurn = false
    for (const p of players) {
      if (p.turn) foundATurn = true
    }
    if (!foundATurn) {
      setMyName(null)
      return
    }
    let txt = ""
    for (const p of players) {
      if (p.uid === uid) {
        setMyName(p.name + ': ' + p.deck.length)
      } else {
        txt += p.name + ': ' + p.deck.length + '\n'
      }
    }
    setOtherNames(txt)
  }, [players])

  if (!otherNames || !myName) return

  return (
    <>
      <mesh position={[.8, 2, -.9]} rotation={[-Math.PI /2,0,0]} scale={.3}>
        <textGeometry args={[myName, { font, size: .1, height: .02,  }]} />
        <meshStandardMaterial attach='material' color='green' />
      </mesh>
      <mesh position={[.8, 2, -.85]} rotation={[-Math.PI /2,0,0]} scale={.3}>
        <textGeometry args={[otherNames, { font, size: .1, height: .02,  }]} />
        <meshStandardMaterial attach='material' color='white' />
      </mesh>
    </>
  )
}

export function CardInfo({ stack }) {
  const [text, setText] = useState()
     
  useEffect(() => {
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