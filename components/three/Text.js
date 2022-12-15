import { useCallback, useRef, useState, useEffect } from "react"
import { TextGeometry } from "three-stdlib"
import roboto from "./font-roboto.json"
import { extend } from "@react-three/fiber"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { useStore, uid } from '../../pages'

const font = new FontLoader().parse(roboto)
extend({ TextGeometry })

export default function Text({ text, position, rotation }) {
  if (!text) return
  
  return (
    <mesh position={position} rotation={rotation}>
      <textGeometry args={[text, { font, size: .1, height: .02,  }]} />
      <meshStandardMaterial attach='material' color='white' />
    </mesh>
  )
}

export function TurnText() {
  const [text, setText] = useState('')
  const players = useStore(state => state.players)

  useEffect(() => {
    console.log(players)
    for (const p of players) {
      if (p.turn && p.name !== text) {
        setText(p.name)
      }
    }
  }, [players])

  if (!text) return

  return (
    <mesh position={[-.4,4,0]} rotation={[0,0,0]}>
      <textGeometry args={[text, { font, size: .1, height: .02,  }]} />
      <meshStandardMaterial attach='material' color='white' />
    </mesh>
  )
}

export function PlayerText() {
  const [otherNames, setOtherNames] = useState('')
  const [myName, setMyName] = useState('')
  const players = useStore(state => state.players)

  useEffect(() => {
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

  if (!otherNames) return

  return (
    <>
      <mesh position={[1,4,0]} rotation={[0,0,0]}>
        <textGeometry args={[myName, { font, size: .1, height: .02,  }]} />
        <meshStandardMaterial attach='material' color='red' />
      </mesh>
      <mesh position={[1,3.8,0]} rotation={[0,0,0]}>
        <textGeometry args={[otherNames, { font, size: .1, height: .02,  }]} />
        <meshStandardMaterial attach='material' color='white' />
      </mesh>
    </>
  )
}