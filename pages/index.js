import { Canvas, useThree, extend } from '@react-three/fiber'
import { RenderPixelatedPass } from 'three-stdlib'
import { useMemo, useEffect, Suspense, useState, useCallback, useReducer } from 'react'
import * as THREE from 'three'
import { socket, breakIntoParts, shuffleArr, copy } from '../constants'
import { Player } from '../constants/class'
import Cube from '../components/three/Cube'
import PlayerComponent from '../components/three/Player'
import Table from '../components/three/Table'
// import Table2 from '../components/three/Table2'
import Computer from '../components/three/Computer'
import  {CSS3DDemo } from '../components/three/Computer'
import Ground from '../components/three/Ground'
import EnemyBasic from '../components/three/EnemyBasic'
import { Physics, Debug } from '@react-three/cannon'
import { useGLTF, OrbitControls, Center, Effects, Preload, PointerLockControls, KeyboardControls, Sky } from '@react-three/drei'
import create from 'zustand'
import Cards, { dropCard, cardKeys } from '../components/three/Cards'
import Button from '../components/three/Button'
import assert from 'assert' // assert.deepEqual(1, 2)
import Text, { TurnText, PlayerText, CardInfo, Timer } from '../components/three/Text'

// https://codesandbox.io/s/pixelated-render-pass-forked-to503e?file=%2Fsrc%2FApp.js
extend({ RenderPixelatedPass })

export const useStore = create(set => ({
  faceOwner: '',
  status: 'ready',
  countdown: false,
  setStatus: status => set(() => ({ status })),
  setCountdown: countdown => set(() => ({ countdown })),
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
export let faceOwner = ''
export let stack = []
export let players = []

export default function index() {
  const [errMsg, setErrMsg] = useState()
  const [playersState, setPlayersState] = useState()
  const [stackState, setStackState] = useState()
  const setCountdown = useStore(state => state.setCountdown)
  const status = useStore(state => state.status)
  const setStatus = useStore(state => state.setStatus)

  useEffect(() => {
    socket.on("join", ioPlayers => {
      for (const [id, player] of Object.entries(ioPlayers)) {
        if (player.uid === uid) {
          const me = players.find(p => p.uid == uid)
          if (!me.id) {
            me.id = id
            players = players.map(p => {
              if (p.id == me.id) return me
              return p
            })
          }
        } else {
          player.id = id
          players.push(player)
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
      // TODO: this will frequently cause a runtime error because of a null player
      console.log('trying to remove', ioPlayer)
      players = players.filter(p => p.id !== ioPlayer.id)
    })

    socket.on("status", status => {
      console.log('status ->', status)
      setCountdown(true)
      setStatus(status)
      setTimeout(() => setStatus(null), 5000)
    })
    
    socket.on('update-to-clients', data => {
      // console.log('state', data)
      // data.face comes in false
      // TODO: this gets ran 5 times for some reason
      // setPlayers(data.players)
      players = data.players
      stack = data.stack
      if (data.face) {
        faceOwner = data.face
      }
    })

    // socket.on('resetAll', () => { } ) // this logic has been moved to <Cards />
    // useStore.subscribe( store => {} ) // don't know of a way this is useful yet
    return () => {
      socket.removeAllListeners('disconnected')
      socket.removeAllListeners('status')
      socket.removeAllListeners('joined')
      socket.removeAllListeners('join')
      socket.removeAllListeners('deck-change')
    }
  }, [socket])

  useEffect(() => {
    const me = new Player(randomName, uid)
    socket.emit('join', me)
    players.push(me)
  }, [])

  useEffect(() => {
    const inter = setInterval(() => {
      try {
        assert.deepEqual(players, playersState)
      } catch (err) {
        setPlayersState(copy(players))
      }
      setStackState(stack)
    }, 300)
    return () => clearInterval(inter)
  }, [playersState])

  useEffect(() => {
    if (status !== 'froze') return
    const timeout = setTimeout(() => setStatus(null), 5000)
    return () => clearTimeout(timeout)
  }, [status])

  function start() {
    // NEAR DUPLICATE of resetAll in <Cards /> this could be dried
    if (players.length < 2) {
      setErrMsg('Not enough players')
      return
    }
    setStatus(null)

    // deals cards
    const evenlyDealt = breakIntoParts(cardKeys.length, players.length)
    shuffleArr(cardKeys)

    evenlyDealt.forEach((size, i) => {
      for (const j in [...Array(size).keys()]) {
        players[i].deck.push(cardKeys.shift())
      }
    })

    // randomly select someone to go first
    players[Math.floor(Math.random()*players.length)].turn = true

    socket.emit('update-to-server', { players, stack: [], state:'start' })
  }
  
  function gameLoop() {
    const me = players.find(p => p.uid == uid)
    // TODO: deliver a message whenever returning
    if (!me.deck.length) {
      setErrMsg("you don't have any cards")
      return
    } else if (!me.turn) {
      setErrMsg('not your turn')
      return
    }
    if (status === 'froze') {
      // console.error('you cannot have a turn while a timer is running')
      setErrMsg('you lost a duel')
      return
    }

    // assumes move is valid and server would not block action
    socket.emit('drop', {
      id: me.id,
      key: me.deck[0]
    })
    dropCard(me.deck[0])

    // see if the hand was lost
    
    // critical points
    // counter is at 0 (no face dropped)
    // counter starts (face dropped)
    // ran out of cards ()

    stack = [...stack, me.deck[0]]
    
    // check if Jack, Queen, King, or Ace
    let face = false
    let duel = false
    let lostDuel = false

    if (me.deck[0].includes('j') ||
        me.deck[0].includes('k') ||
        me.deck[0].includes('q') ||
        me.deck[0].includes('a')) {
      face = true
      faceOwner = uid
    } else {
      // check to see if duel failed
      // console.log('check for duel in stack', stack, faceOwner)
      for (const i in stack) {
        if (i > 3) break
        const endIndex = (Number(i) + 2) * -1
        const card = stack.at(endIndex)
        // console.log('card', card, 'at', i, 'from end')
        if (!card) continue

        // losing duel points
        if (i == 0 && card.includes('j')) {
          lostDuel = true
        } else if (i == 1 && card.includes('q')) {
          lostDuel = true
        } else if (i == 2 && card.includes('k')) {
          lostDuel = true
        } else if (i == 3 && card.includes('a')) {
          lostDuel = true
        }

        if (lostDuel) {
          setStatus('froze')
          socket.emit('status', 'froze')
          setCountdown(true)

          // update stack everywhere
          for (const i in players) {
            if (players[i].uid == uid) players[i].deck.shift()
          }
          socket.emit('update-to-server', { players, stack })

          setTimeout(stack => {
            // this has the stack info at start of duel which
            // could be used for a better check system
            winStack(faceOwner, 'duel')
          }, 5000, stack)
          return
        }

        // check for ongoing duel
        if (card.includes('q') ||
            card.includes('k') ||
            card.includes('a')) {
          duel = true
          // console.log('duel in progress')
          // console.log('Found duel card', card, 'at', i, 'from end. keeping turn state')
          break
        }
      }
    }

    // const tempStack = Array.from(stack)
    // tempStack.push(me.deck[0]) // push is mutable

    // remove index 0 card
    for (const i in players) {
      if (players[i].uid == uid) {

        players[i].deck.shift()

        // change turn if played face, no cards, or in duel
        if (face || !players[i].deck.length || !duel) {
          // console.log('face', face, ' || out of cards', players[i].deck.length)

          // only include people with cards as those who can have a turn
          const withCards = players.filter(p => p.deck.length)
  
          // TODO: could be a goal state if last opponent card is dropped
          if (withCards.length < 2) {
            setStatus('froze')
            socket.emit('status', 'froze')
            setCountdown(true)

            // update stack everywhere
            socket.emit('update-to-server', { players, stack })

            setTimeout(stack => {
              console.log('triggered end game because you played your last card')
              endGame(withCards[0].id)
            }, 5000, stack)

            return
          }
  
          // set next turn
          let index = withCards.findIndex(p => p.turn == true)
          players[index].turn = false
          if (index == withCards.length - 1) {
            index = -1
          }
          players[index + 1].turn = true
        }
      }
    }

    socket.emit('update-to-server', { players, stack, faceOwner: face && uid})
  }

  function slap() {
    if (stack.length < 2) {
      setErrMsg('not enough cards to slap')
      return
    } else {
      // double
      const latestType = stack.at(-1).charAt(0) // i.e. a, k, 4, 7
      // console.log('2x compare', latestType, stack.at(-2).charAt(0))
      if (latestType == stack.at(-2).charAt(0)) {
        // console.log('DOUBLE slap of type', latestType)
        winStack(uid, 'slap')
        return
      }
  
      // sandwich
      if (stack.length > 2) {
        // console.log('sandwich compare', latestType, stack.at(-3).charAt(0))
        if (latestType == stack.at(-3).charAt(0)) {
          // console.log('SANDWICH slap of type', latestType)
          winStack(uid, 'slap')
          return
        }
      }
    }
    setErrMsg('bad slap')

    // burn 2 cards
    for (const i in players) {
      if (players[i].uid == uid) {
        
        // see if at least 1 card
        if (!players[i].deck.length) return

        // take next card
        let burnedCard = players[i].deck.shift()
        socket.emit('drop', {
          id: players[i].id,
          key: burnedCard,
          burn: true
        })
        dropCard(burnedCard, true)

        // add to bottom of stack
        stack = [burnedCard, ...stack]
        
        // still have a card
        if (players[i].deck.length) {

          // take next card
          burnedCard = players[i].deck.shift()
          
          socket.emit('drop', {
            id: players[i].id,
            key: burnedCard,
            burn: true,
            secondBurn: true
          })
          
          dropCard(burnedCard, true, true)
          
          // add to bottom of stack
          stack = [burnedCard, ...stack]
        }

        // check if youre out of cards and turn should change
        if (!players[i].deck.length) {

          const withCards = players.filter(p => p.deck.length)
          if (withCards.length < 2) {
            console.log('triggering end game due to bad slap')
            endGame(withCards[0].id)
            return
          }

          if (players[i].turn) {
            // set next turn
            let index = withCards.findIndex(p => p.turn == true)
            withCards[index].turn = false
            if (index == withCards.length - 1) {
              index = -1
            }
            withCards[index + 1].turn = true
          }
    
        }

        socket.emit('update-to-server', { players, stack })
      }
    }
  }

  function endGame(winnerID) {
    // check if someone did a successful slap
    const withCards = players.filter(p => p.deck.length)
    if (withCards.length > 1) return

    for (const i in players) {
      if (players[i].id == winnerID) {
        setErrMsg(players[i].name + ' has won!')
      }
      players[i].deck = []
      players[i].turn = false
    }
    stack = []
    setStatus('ready')
    socket.emit('update-to-server', { players, stack, state: 'win' })
  }

  function winStack(winnerUID, type) {

    // TODO: should do a better check on if a good slap happened
    if (type == 'duel') {
      if (stack.length < 2) {
        console.log('duel stolen')
        return
      }
    }

    // remove whoever had turn before
    let index = players.findIndex(p => p.turn == true)
    players[index].turn = false

    for (const i in players) {
      if (players[i].uid == winnerUID) {
        players[i].turn = true // set it to my turn
        players[i].deck.push(...stack) // mutable
      }
    }

    stack = []
    socket.emit('update-to-server', { players, stack: [], state: 'win' })
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
      <Canvas shadows camera={{ fov: 50 }} style={{height: '100vh'}}>
        <Suspense fallback={<></>}>
          <Sky sunPosition={[100, 20, 100]} distance={5000} />
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={.4} />
          <pointLight  castShadow intensity={2} position={[20, 50, 0]}  color="#5A5233" />
          <directionalLight castShadow intensity={2} position={[30, 200, 49]}  />
          <Physics gravity={[0, -2, 0]}>
            {/* <Debug color="black" scale={1}> */}
              <Ground />
              <PlayerComponent slap={slap} gameLoop={gameLoop} />
              <Table />
              {/* <EnemyBasic /> */}
              <Cards />
              {/* <Text position={[-.4,2,1.6]} rotation={[-Math.PI /2,0,0]} text="Change Turn" /> */}
              <Text position={[-.07, 2, -1.6]} rotation={[-Math.PI /2,0,0]} scale={.5} players={playersState} text="Start" />
              {/* <Text position={[1.6,2,.2]} rotation={[-Math.PI /2,0,Math.PI /2]} text="Reset" /> */}
              {/* <Text position={[-1.6,2,-.3]} rotation={[-Math.PI /2,0,-Math.PI /2]} text={errMsg} /> */}
              <Text position={[-.15, 2, -.9]} rotation={[-Math.PI /2,0,0]} scale={.5} text={errMsg} setText={setErrMsg} players={playersState} />
              <TurnText players={playersState} />
              <Timer />
              <CardInfo stack={stackState} />
              <PlayerText players={playersState} />
              {/* <Scene2 /> */}
              {/* <Scene /> */}
              {/* <Debug /> */}
              <Button position={[0, 2, -1.8]} action={start} color="green" players={playersState} />
              {/* <Button position={[0, 2, 1.8]} action={nextTurn} color="yellow" /> */}
              {/* <Button position={[1.8, 2, 0]} action={() => socket.emit('reset')} color="red" /> */}
              {/* <Button position={[-1.8, 2, 0]} action={() => console.log(players)} color="blue" /> */}
            {/* </Debug> */}
          </Physics>
          <PointerLockControls />
          <Preload all />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}