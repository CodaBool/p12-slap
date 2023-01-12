import * as THREE from "three"
import { useLoader } from '@react-three/fiber'
import { useBox, useContactMaterial } from '@react-three/cannon'
import { useMemo, useEffect, useState, useRef } from 'react'
import { socket } from '../../constants'

const assets = [
  '10_of_clubs.png',
  '10_of_diamonds.png',
  '10_of_hearts.png',
  '10_of_spades.png',
  '2_of_clubs.png',
  '2_of_diamonds.png',
  '2_of_hearts.png',
  '2_of_spades.png',
  '3_of_clubs.png',
  '3_of_diamonds.png',
  '3_of_hearts.png',
  '3_of_spades.png',
  '4_of_clubs.png',
  '4_of_diamonds.png',
  '4_of_hearts.png',
  '4_of_spades.png',
  '5_of_clubs.png',
  '5_of_diamonds.png',
  '5_of_hearts.png',
  '5_of_spades.png',
  '6_of_clubs.png',
  '6_of_diamonds.png',
  '6_of_hearts.png',
  '6_of_spades.png',
  '7_of_clubs.png',
  '7_of_diamonds.png',
  '7_of_hearts.png',
  '7_of_spades.png',
  '8_of_clubs.png',
  '8_of_diamonds.png',
  '8_of_hearts.png',
  '8_of_spades.png',
  '9_of_clubs.png',
  '9_of_diamonds.png',
  '9_of_hearts.png',
  '9_of_spades.png',
  'jack_of_clubs.png',
  'jack_of_diamonds.png',
  'jack_of_hearts.png',
  'jack_of_spades.png',
  'king_of_clubs.png',
  'king_of_diamonds.png',
  'king_of_hearts.png',
  'king_of_spades.png',
  'queen_of_clubs.png',
  'queen_of_diamonds.png',
  'queen_of_hearts.png',
  'ace_of_spades.png',
  'ace_of_hearts.png',
  'ace_of_diamonds.png',
  'ace_of_clubs.png',
  'queen_of_spades.png'
]

export const cardKeys = []
const cardRefs = []

export function dropCard(key, burn, secondBurn) {
  const card = cardRefs.find(card => card.key === key)
  card.ref.current.api.wakeUp()
  if (burn) {
    if (secondBurn) {
      card.ref.current.api.position.set(1,4,0)
    } else {
      card.ref.current.api.position.set(1,3.5,0)
    }
    card.ref.current.api.rotation.set(2.5,0,.2)
  } else {
    card.ref.current.api.position.set(0,3.5,0)
    const tilt = Math.random() > .5
    card.ref.current.api.rotation.set(2.5,Math.random()*500 * tilt ? -.1:.1,.2)
  }
}

const cardMaterial = 'card'

export default function Cards() {
  const [cards, setCards] = useState(createCards())

  useEffect(() => {
    if (cards.length && !cardKeys.length) {
      for (const fileName of assets) {
        cardKeys.push(fileName.split('_')[0].charAt(0) + fileName.split('_')[2].charAt(0))
      }
      for (const card of cards) {
        cardRefs.push(card)
      }
    }
  }, [cards])

  useEffect(() => {
    socket.on('dropAll', data => {
      dropCard(data.card, data.burn)
    })
    socket.on('resetAll', () => {
      cards.forEach((card, i) => {
        card.ref.current.api.wakeUp()
        card.ref.current.api.position.set(1 * i, 1, 100)
        card.ref.current.api.rotation.set(0,0,0)
      })
    })
    return () => {
      socket.removeAllListeners('resetAll')
      socket.removeAllListeners('dropAll')
    }
  }, [socket, cards]) // adding 'cards' to dependency breaks player joining

  function createCards() {
    const arr = []
    for (const [i, name] of assets.entries()) {
      
      useContactMaterial(cardMaterial, cardMaterial, {
        // contactEquationRelaxation: 3,
        // contactEquationStiffness: 1e8,
        friction: 100,
        // frictionEquationStiffness: 1e8,
        restitution: .1,
      })
      const [ref, api] = useBox(() => ({ position: [1 * i,1,100], mass: .01, args: [.5,.05,.7], material: cardMaterial}))
      // api.sleep()
      const map = useLoader(THREE.TextureLoader, '/assets/cards/' + name)
      const key = name.split('_')[0].charAt(0) + name.split('_')[2].charAt(0)
      arr.push(
        <mesh key={key} ref={ref} api={api} >
          <boxGeometry args={[.5,.01,.7]}  />
          <meshBasicMaterial attach="material-0" color="white" />
          <meshBasicMaterial attach="material-1" color="white" />
          <meshStandardMaterial attach="material-2" map={map} />
          <meshStandardMaterial attach="material-3" map={map} />
          <meshBasicMaterial attach="material-4" color="white" />
          <meshBasicMaterial attach="material-5" color="white" />
        </mesh>
      )
    }
    return arr
  }

  return cards
}


