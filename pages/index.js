import { Canvas, useThree, extend } from '@react-three/fiber'
import { RenderPixelatedPass } from 'three-stdlib'
import { useMemo, useEffect, Suspense, useState } from 'react'
import * as THREE from 'three'
import { socket, breakIntoParts } from '../constants'
import { Player } from '../constants/class'
import Cube from '../components/three/Cube'
import PlayerComponent from '../components/three/Player'
import Table from '../components/three/Table'
// import Table2 from '../components/three/Table2'
import Computer from '../components/three/Computer'
import {CSS3DDemo} from '../components/three/Computer'
import Ground from '../components/three/Ground'
import EnemyBasic from '../components/three/EnemyBasic'
import { Physics, Debug } from "@react-three/rapier"
import { useGLTF, OrbitControls, Center, Effects, Preload, PointerLockControls, KeyboardControls, Sky } from '@react-three/drei'
import create from 'zustand'
import Cards, { dropCard } from '../components/three/Cards'
import Button from '../components/three/Button'
import Text, { TurnText, PlayerText } from '../components/three/Text'

// https://codesandbox.io/s/pixelated-render-pass-forked-to503e?file=%2Fsrc%2FApp.js
extend({ RenderPixelatedPass })

export const useStore = create(set => ({
  cards: [],
  players: [],
  stack: [],
  setStack: stack => set(() => ({ stack })),
  addToStack: item => set(state => ({ 
    stack: [item, ...state.stack]
  })),
  setCards: cards => set(() => ({ cards })),
  modPlayer: moddedP => set(state => ( // this method will be subscribable with useEffect
    { players: state.players.map(p => {
        if (p.id == moddedP.id) return moddedP
        return p
      })
    }
  )),
  alterDeck: gamers => set(state => ( // this method will be subscribable with useEffect
    { players: state.players.map(p => {
        if (p.id == moddedP.id) return moddedP
        return p
      })
    }
  )),
  // you need to clone array with Array.from() to allow a change to be subscribable with useEffect
  setPlayers: players => set(() => ({ players })), 
  addPlayer: player => set(state => ({ 
    players: [player, ...state.players]
  })),
  removePlayer: player => set(state => ({ 
    players: state.players.filter(p => p.id !== player.id)
  })),
}))

function Scene() {
  const { size, scene, camera } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  if (camera) return (
    <>
      <Effects>
        <renderPixelatedPass args={[resolution, 6, scene, camera]} />
      </Effects>
    </>
  )
}

function Scene2() {
  const { size, scene, camera } = useThree()
  useEffect(() => {
    new CSS3DDemo(scene, camera)
  }, [])
  
  if (camera) return (
    <>
    </>
  )
}

const randomName = (Math.random() + 1).toString(36).substring(7)
export const uid = Math.random().toString(16).slice(2)

export default function index() {
  const [errMsg, setErrMsg] = useState()
  const cards = useStore(state => state.cards)
  const players = useStore(state => state.players)
  const addPlayer = useStore(state => state.addPlayer)
  const removePlayer = useStore(state => state.removePlayer)
  const setPlayers = useStore(state => state.setPlayers)
  const modPlayer = useStore(state => state.modPlayer)
  const stack = useStore(state => state.stack)
  const setStack = useStore(state => state.setStack)
  const addToStack = useStore(state => state.addToStack)

  useEffect(() => {
    socket.on("join", ioPlayers => {
      for (const [id, player] of Object.entries(ioPlayers)) {
        if (player.uid === uid) {
          const me = players.find(p => p.uid == uid)
          if (!me.id) {
            me.id = id
            modPlayer(me)
          }
        } else {
          player.id = id
          addPlayer(player)
        }
      }
    })
    
    socket.on("joined", data => {
      // console.log('JOINED:', data)
      if (data) {
        data.forEach((player, index) => {
          // console.log('JOINED: looping new players', player)
        })
      }
    })

    socket.on("disconnected", ioPlayer => {
      // got a runtime error because of a null player
      // happened 2x now in dev
      console.log('trying to remove', ioPlayer)
      removePlayer(ioPlayer)
    })
    
    socket.on('update-to-clients', gamers => {
      console.log('game update', gamers)

      setPlayers(gamers)
    })

    // socket.on('resetAll', () => { } ) // this logic has been moved to <Cards />
    // useStore.subscribe( store => {} ) // don't know of a way this is useful yet
    return () => {
      socket.removeAllListeners('disconnected')
      socket.removeAllListeners('joined')
      socket.removeAllListeners('join')
      socket.removeAllListeners('"deck-change"')
    }
  }, [socket, players])

  useEffect(() => {
    const me = new Player(randomName, uid)
    socket.emit('join', me)
    addPlayer(me)
  }, [])

  function start() {
    // NEAR DUPLICATE of resetAll in <Cards /> this could be dried
    if (players.length < 2) {
      setErrMsg('Not enough players')
      return
    }
    const gamers = Array.from(players)

    // deals cards
    const evenlyDealt = breakIntoParts(cards.length, gamers.length)
    evenlyDealt.forEach((size, i) => {
      for (const j in [...Array(size).keys()]) {
        gamers[i].deck.push(cards[Math.floor(Math.random()*cards.length)].key)
      }
    })

    // randomly select someone to go first
    gamers[Math.floor(Math.random()*gamers.length)].turn = true
    
    // update store
    setPlayers(gamers)
    // update room
    socket.emit('update-to-server', gamers)
  }
  
  function gameLoop() {
    const me = players.find(p => p.uid == uid)
    // TODO: deliver a message whenever returning
    if (!me.turn) {
      setErrMsg('not your turn')
      return
    }
    if (!me.deck.length) {
      setErrMsg('you have no more cards')
      return
    } // a new turn should be picked here

    console.log('DEBUG: drop', me.deck[0])

    // assumes move is valid and server would not block action
    socket.emit('drop', {
      id: me.id,
      key: me.deck[0]
    })
    
    dropCard(cards, me.deck[0])

    // see if the hand was lost
    
    // critical points
    // counter is at 0 (no face dropped)
    // counter starts (face dropped)
    // ran out of cards ()

    // add to stack
    addToStack(me.deck[0])
    
    let gamers = Array.from(players)

    // check if J, Q, K, or A
    let hasFace = false
    if (me.deck[0].includes('j') ||
        me.deck[0].includes('k') ||
        me.deck[0].includes('q') ||
        me.deck[0].includes('a')) {
      
      hasFace = true
      // only include people with cards as those who can have a turn
      gamers = gamers.filter(gamer => gamer.deck.length)

      // TODO: could be a goal state if last opponent card is dropped
      if (gamers.length < 2) console.log('SPECIAL CASE!')

      // set next turn
      let index = gamers.findIndex(p => p.turn == true)
      gamers[index].turn = false
      if (index == gamers.length - 1) {
        index = -1
      }
      gamers[index + 1].turn = true
      console.log('set to', gamers[index + 1].name, 'turn')
    }

    // remove index 0 card
    for (const i in gamers) {
      if (gamers[i].uid == uid) {
        gamers[i].deck.shift() 
      }
    }

    

    setPlayers(gamers)
    socket.emit('update-to-server', gamers)
  }

  function slap() {
    console.log('slap', stack)
  }
  
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "run", keys: ["Shift"] },
      ]}>
      <Canvas shadows camera={{ fov: 60 }} style={{height: '100vh'}}>
        <Suspense fallback={<></>}>
          <Sky sunPosition={[100, 20, 100]} distance={5000} />
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={.4} />
          <pointLight  castShadow intensity={2} position={[20, 50, 0]}  color="#5A5233" />
          <directionalLight castShadow intensity={2} position={[30, 200, 49]}  />
          <Physics gravity={[0, -9.8, 0]}>
            <Ground />
            <PlayerComponent slap={slap} gameLoop={gameLoop} />
            <Table />
            {/* <EnemyBasic /> */}
            <Cards />
            <Text position={[-.4,2,1.6]} rotation={[-Math.PI /2,0,0]} text="Change Turn" />
            <Text position={[.2,2,-1.6]} rotation={[-Math.PI /2,0,Math.PI]} text="Start" />
            <Text position={[1.6,2,.2]} rotation={[-Math.PI /2,0,Math.PI /2]} text="Reset" />
            <Text position={[-1.6,2,-.3]} rotation={[-Math.PI /2,0,-Math.PI /2]} text={errMsg} />
            <TurnText />
            <PlayerText />
            {/* <Scene2 /> */}
            {/* <Scene /> */}
            {/* <Debug /> */}
            <Button position={[0, 2, -1.8]} action={start} color="green" />
            {/* <Button position={[0, 2, 1.8]} action={nextTurn} color="yellow" /> */}
            <Button position={[1.8, 2, 0]} action={() => socket.emit('reset')} color="red" />
            <Button position={[-1.8, 2, 0]} action={() => console.log(players)} color="blue" />
          </Physics>
          <PointerLockControls />
          <Preload all />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}