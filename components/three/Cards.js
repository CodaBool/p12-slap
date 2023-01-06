import * as THREE from "three"
import { useLoader } from '@react-three/fiber'
import { useBox, useContactMaterial } from '@react-three/cannon'
import { useMemo, useEffect, useState, useRef } from 'react'
import { Player } from '../../constants/class'
import { useStore } from '../../pages'
import { socket, breakIntoParts } from '../../constants'

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

export function dropCard(cards, key) {

  // console.log('teleport', key)
  const card = cards.find(card => card.key === key)
  // console.log(card)
  card.ref.current.api.wakeUp()
  // card.ref.current.api.mass.set(1)
  card.ref.current.api.position.set(0,3.5,0)
  const tilt = Math.random() > .5
  card.ref.current.api.rotation.set(2.5,Math.random()*500 * tilt ? -.1:.1,.2)
  // console.log(card)
  //card.ref.current.setTranslation({ x: 0, y: 5, z: 0 }, true)
  // TODO: this seems like it's relative rotation and could casue issues
  //card.ref.current.setRotation({ w: 1, x: 2, y: Math.random()*.1 * tilt ? -1:1, z: 0 }, true)
}

const cardMaterial = 'card'

export default function Cards() {
  const [localCards, setLocalCards] = useState(createCards())
  const cards = useStore(state => state.cards)
  const stack = useStore(state => state.stack)
  const setCards = useStore(state => state.setCards)
  const setPlayers = useStore(state => state.setPlayers)

  useEffect(() => {
    if (localCards.length) {
      if (cards.length === 0) {
        // TODO: see if store can be used for this whole component
        setCards(localCards)
      }
    }
  }, [localCards])

  useEffect(() => {
    socket.on('dropAll', key => {
      dropCard(cards, key)
    })
    socket.on('resetAll', () => {
      console.log('resetAll happened')
      localCards.forEach((card, i) => {
        card.ref.current.api.wakeUp()
        card.ref.current.api.position.set(1 * i, 1, 100)
        card.ref.current.api.rotation.set(0,0,0)
      })
    })
    return () => {
      socket.removeAllListeners('resetAll')
      socket.removeAllListeners('dropAll')
    }
  }, [socket, cards, localCards]) // adding 'cards' to dependency breaks player joining

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
      //   <mesh ref={ref} castShadow receiveShadow>
      //   <boxBufferGeometry args={args} />
      //   <meshLambertMaterial color={color} />
      // </mesh>
      )
    }
    return arr
  }

  return localCards
}


