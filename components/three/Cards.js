import * as THREE from "three"
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import React, { useMemo, useEffect, useState, useRef } from 'react'
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
const apiRefs = []

export function dropCard(key, type) {
  const card = apiRefs.find(obj => obj.name === key)
  // card.current.api.wakeUp()
  if (type.includes('Burn')) {
    if (type == "secondBurn") {
      card.ref.current.setTranslation({ x: 1, y: 4, z: 0 }, true)
    } else {
      card.ref.current.setTranslation({ x: 1, y: 3.5, z: 0 }, true)
    }
    card.ref.current.setRotation({ w: 1, x: 2.5, y: 0, z: .2 }, true)
  } else {
    card.ref.current.setTranslation({ x: 0, y: 3.5, z: 0 }, true)
    const tilt = Math.random() > .5
    card.ref.current.setRotation({ w: 1, x: 2.5, y: Math.random()*500 * tilt ? -.1:.1, z: .2 }, true)
  }
}

function CardComponent({texture, i, name}) {
  const ref = useRef()
  apiRefs.push({ref, name})
  return (
    <RigidBody position={[1 * i,1,100]} ref={ref} colliders={false}>
      <mesh>
        <boxGeometry args={[.5,.04,.7]} />
        <meshBasicMaterial attach="material-0" color="white" />
        <meshBasicMaterial attach="material-1" color="white" />
        <meshStandardMaterial attach="material-2" map={texture} />
        <meshStandardMaterial attach="material-3" map={texture} />
        <meshBasicMaterial attach="material-4" color="white" />
        <meshBasicMaterial attach="material-5" color="white" />
      </mesh>
      <CuboidCollider args={[.25,.02,.35]} />
    </RigidBody>
  )
}

export default function Cards() {
  const [cards, setCards] = useState()

  useEffect(() => {
    if (!cards?.length) createCards()
    if (cards?.length && !cardKeys.length) {
      for (const name of assets) {
        cardKeys.push(name.split('_')[0].charAt(0) + name.split('_')[2].charAt(0))
      }
    }
  }, [cards])

  useEffect(() => {
    socket.on('drop', data => {
      dropCard(data.key, data.type)
    })
    socket.on('reset', () => {
      apiRefs.forEach((obj, i) => {
        obj.ref.current.setTranslation({ x: 1 * i, y: 1, z: 100 }, true)
        obj.ref.current.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true)
      })
    })
    return () => {
      socket.off('reset')
      socket.off('drop')
    }
  }, [])

  function createCards() {
    const promises = []
    // if not doing async then use useLoader
    for (const name of assets) {
      promises.push(new THREE.TextureLoader().loadAsync('/assets/cards/' + name))
    }

    Promise.allSettled(promises)
      .then(results => {
        const textureArr = []
        results.forEach(result => {
          if (result?.status == 'fulfilled') {
            textureArr.push(result?.value)
          } else {
            console.log(`😨 something went wrong sending update for ${result?.value}`, result)
          }
        })
        if (textureArr.length == 52) {
          setCards(textureArr.map((texture, index) => {
            const firstSplit = texture.source.data.src.split('/')
            const secondSplit = firstSplit[firstSplit.length - 1].split('_')
            const key = secondSplit[0].charAt(0) + secondSplit[2].charAt(0)
            return <CardComponent texture={texture} key={texture.uuid} name={key} i={index} />
          }
          ))
        } else {
          console.log('failed to load cards', textureArr)
        }
      })
  }

  if (!cards?.length) return
  return cards
}


