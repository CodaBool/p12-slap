import {useEffect, useState, useRef} from 'react'
import { cardNames, TextureAtlas } from '../../constants'
import { useTexture } from "@react-three/drei"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { socket } from '../../constants'

const manifest = {
  "meta": {
    "image": "cards-1200-w.png",
    "size": { "w": 1200, "h": 527 },
    "scale": "1"
  },
  "frames": {
    "ad": { "frame": { "x": 0, "y": 0, "w": 92, "h": 132 } },
    "ah": { "frame": { "x": 0, "y": 132, "w": 92, "h": 132 } },
    "as": { "frame": { "x": 0, "y": 264, "w": 92, "h": 132 } },
    "ac": { "frame": { "x": 0, "y": 396, "w": 92, "h": 132 } },
    "2d": { "frame": { "x": 92, "y": 0, "w": 92, "h": 132 } },
    "2h": { "frame": { "x": 92, "y": 132, "w": 92, "h": 132 } },
    "2s": { "frame": { "x": 92, "y": 264, "w": 92, "h": 132 } },
    "2c": { "frame": { "x": 92, "y": 396, "w": 92, "h": 132 } },
    "3d": { "frame": { "x": 184, "y": 0, "w": 92, "h": 132 } },
    "3h": { "frame": { "x": 184, "y": 132, "w": 92, "h": 132 } },
    "3s": { "frame": { "x": 184, "y": 264, "w": 92, "h": 132 } },
    "3c": { "frame": { "x": 184, "y": 396, "w": 92, "h": 132 } },
    "4d": { "frame": { "x": 276, "y": 0, "w": 92, "h": 132 } },
    "4h": { "frame": { "x": 276, "y": 132, "w": 92, "h": 132 } },
    "4s": { "frame": { "x": 276, "y": 264, "w": 92, "h": 132 } },
    "4c": { "frame": { "x": 276, "y": 396, "w": 92, "h": 132 } },
    "5d": { "frame": { "x": 368, "y": 0, "w": 92, "h": 132 } },
    "5h": { "frame": { "x": 368, "y": 132, "w": 92, "h": 132 } },
    "5s": { "frame": { "x": 368, "y": 264, "w": 92, "h": 132 } },
    "5c": { "frame": { "x": 368, "y": 396, "w": 92, "h": 132 } },
    "6d": { "frame": { "x": 460, "y": 0, "w": 92, "h": 132 } },
    "6h": { "frame": { "x": 460, "y": 132, "w": 92, "h": 132 } },
    "6s": { "frame": { "x": 460, "y": 264, "w": 92, "h": 132 } },
    "6c": { "frame": { "x": 460, "y": 396, "w": 92, "h": 132 } },
    "7d": { "frame": { "x": 552, "y": 0, "w": 92, "h": 132 } },
    "7h": { "frame": { "x": 552, "y": 132, "w": 92, "h": 132 } },
    "7s": { "frame": { "x": 552, "y": 264, "w": 92, "h": 132 } },
    "7c": { "frame": { "x": 552, "y": 396, "w": 92, "h": 132 } },
    "8d": { "frame": { "x": 644, "y": 0, "w": 92, "h": 132 } },
    "8h": { "frame": { "x": 644, "y": 132, "w": 92, "h": 132 } },
    "8s": { "frame": { "x": 644, "y": 264, "w": 92, "h": 132 } },
    "8c": { "frame": { "x": 644, "y": 396, "w": 92, "h": 132 } },
    "9d": { "frame": { "x": 736, "y": 0, "w": 92, "h": 132 } },
    "9h": { "frame": { "x": 736, "y": 132, "w": 92, "h": 132 } },
    "9s": { "frame": { "x": 736, "y": 264, "w": 92, "h": 132 } },
    "9c": { "frame": { "x": 736, "y": 396, "w": 92, "h": 132 } },
    "1d": { "frame": { "x": 828, "y": 0, "w": 92, "h": 132 } },
    "1h": { "frame": { "x": 828, "y": 132, "w": 92, "h": 132 } },
    "1s": { "frame": { "x": 828, "y": 264, "w": 92, "h": 132 } },
    "1c": { "frame": { "x": 828, "y": 396, "w": 92, "h": 132 } },
    "jd": { "frame": { "x": 920, "y": 0, "w": 92, "h": 132 } },
    "jh": { "frame": { "x": 920, "y": 132, "w": 92, "h": 132 } },
    "js": { "frame": { "x": 920, "y": 264, "w": 92, "h": 132 } },
    "jc": { "frame": { "x": 920, "y": 396, "w": 92, "h": 132 } },
    "qd": { "frame": { "x": 1012, "y": 0, "w": 92, "h": 132 } },
    "qh": { "frame": { "x": 1012, "y": 132, "w": 92, "h": 132 } },
    "qs": { "frame": { "x": 1012, "y": 264, "w": 92, "h": 132 } },
    "qc": { "frame": { "x": 1012, "y": 396, "w": 92, "h": 132 } },
    "kd": { "frame": { "x": 1104, "y": 0, "w": 92, "h": 132 } },
    "kh": { "frame": { "x": 1104, "y": 132, "w": 92, "h": 132 } },
    "ks": { "frame": { "x": 1104, "y": 264, "w": 92, "h": 132 } },
    "kc": { "frame": { "x": 1104, "y": 396, "w": 92, "h": 132 } }
  }
}

const apiRefs = []

function CardComponent({texture, i, name}) {
  const ref = useRef()
  // texture.minFilter = THREE.NearestFilter;
  // texture.magFilter = THREE.NearestFilter;
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

export function dropCard(key, type) {
  const card = apiRefs.find(obj => obj.name === key)
  console.log('drop',  key)
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

export default function CardsV2() {
  const textureSheet = useTexture("/cards.png")
  const [textures, setTextures] = useState()
  const [cards, setCards] = useState()

  useEffect(() => {
    socket.on('drop', data => {
      dropCard(data.key, data.type)
    })
    socket.on('reset', () => {
      apiRefs.forEach((obj, i) => {
        obj.ref.current.setTranslation({ x: 1 * i, y: 1, z: 250 }, true)
        obj.ref.current.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true)
      })
    })
    return () => {
      socket.off('reset')
      socket.off('drop')
    }
  }, [])
  
  useEffect(() => {
    if (textureSheet && textures === undefined) {
      const textureAtlas = new TextureAtlas(manifest, textureSheet)
      setTextures(cardNames.map(name => (
        textureAtlas.getTexture(name)
      )))
    }
  }, [textureSheet])

  useEffect(() => {
    if (textures !== undefined && cards === undefined) {
      setCards(textures.map((texture, index) => (
        <CardComponent texture={texture} key={texture.uuid} name={texture.name} i={index} />
      )))
    }
  }, [textures])

  if (!cards?.length) return
  return cards
}