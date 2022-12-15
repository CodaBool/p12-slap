import * as THREE from "three"
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from "@react-three/rapier"
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
  console.log('teleport', key)
  const card = cards.find(card => card.key === key)
  card.ref.current.setTranslation({ x: 0, y: 5, z: 0 }, true)
  // TODO: this seems like it's relative rotation and could casue issues
  const tilt = Math.random() > .5
  card.ref.current.setRotation({ w: 1, x: 2, y: Math.random()*.1 * tilt ? -1:1, z: 0 }, true)
}

export default function Cards() {
  const [localCards, setLocalCards] = useState(createCards())
  const cards = useStore(state => state.cards)
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
      localCards.forEach((card, i) => {
        card.ref.current.setTranslation({ x: 1 * i, y: -3, z: 0 }, true)
        card.ref.current.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true)
      })
      // TODO: dry this code, duplicate of index.js
      // Temporary local play
      const playersTemp = [new Player("luigi", 123), new Player("mario", 456)]
  
      // deal cards
      const evenlyDealt = breakIntoParts(localCards.length, playersTemp.length)
      evenlyDealt.forEach((size, i) => {
        playersTemp[i].deck = []
        for (const j in [...Array(size).keys()]) {
          
          playersTemp[i].deck.push(localCards[Math.floor(Math.random()*localCards.length)])
        }
      })
      
      // set a random first player
      const rand = Math.floor(Math.random()*playersTemp.length)
  
      const index = playersTemp.findIndex(p => p.turn == true)
      if (index > 0) {
        playersTemp[index].turn = false
      }
      playersTemp[rand].turn = true

      // TODO: find a way to setTurnName globally
      // setTurnName(playersTemp[rand].name)
  
      setPlayers(playersTemp)
    })
    return () => {
      socket.removeAllListeners('resetAll')
      socket.removeAllListeners('dropAll')
    }
  }, [socket, cards]) // adding 'cards' to dependency breaks player joining

  

  function createCards() {
    const arr = []
    for (const [i, name] of assets.entries()) {
      const ref = useRef()
      const map = useLoader(THREE.TextureLoader, '/assets/cards/' + name)
      const key = name.split('_')[0].charAt(0) + name.split('_')[2].charAt(0)
      const position = [1 * i,-3,0]
      arr.push(
        <RigidBody position={position} key={key} ref={ref}>
          <mesh>
            <boxGeometry args={[.5,.01,.7]}  />
            <meshBasicMaterial attach="material-0" color="white" />
            <meshBasicMaterial attach="material-1" color="white" />
            <meshStandardMaterial attach="material-2" map={map} />
            <meshStandardMaterial attach="material-3" map={map} />
            <meshBasicMaterial attach="material-4" color="white" />
            <meshBasicMaterial attach="material-5" color="white" />
          </mesh>
          <CuboidCollider args={[.25,.025,.35]} />
        </RigidBody>
      )
    }
    return arr
  }

  return localCards
}


