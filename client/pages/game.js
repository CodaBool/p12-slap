import { Canvas, useThree, extend } from '@react-three/fiber'
import { RenderPixelatedPass } from 'three-stdlib'
import { useMemo, useEffect, Suspense, useState, useCallback, useReducer } from 'react'
import * as THREE from 'three'
import { socket, breakIntoParts, shuffleArr, copy, cardNames } from '../constants'
// import Cube from '../components/three/Cube'
// import PlayerComponent from '../components/three/Player'
import Table from '../components/three/Table'
import Room from '../components/three/Room'
import PlayersAndChairs from '../components/three/PlayerV2'
// import AllOtherPlayers from '../components/three/OtherPlayer'
// import Computer from '../components/three/Computer'
import UI from '../components/UI'
import  {CSS3DDemo } from '../components/three/Computer'
import Ground from '../components/three/Ground'
// import EnemyBasic from '../components/three/EnemyBasic'
import { Physics, Debug } from "@react-three/rapier"
import { Effects, Preload, PointerLockControls, KeyboardControls, Sky, Stats, stats } from '@react-three/drei'
import { create } from 'zustand'
import Button from '../components/three/Button'
import Cards, { dropCard } from '../components/three/CardsV2'
import { useRouter } from 'next/router'
import assert from 'assert'
import { uid } from './index'
import TextMesh, { TurnText, PlayerText, CardInfo, Timer } from '../components/three/Text'
import {Load} from '../components/Load'
import { Perf } from 'r3f-perf'

// https://codesandbox.io/s/pixelated-render-pass-forked-to503e?file=%2Fsrc%2FApp.js
extend({ RenderPixelatedPass })

export const useStore = create(set => ({
  faceOwner: '',
  status: 'ready',
  countdown: false,
  locked: false,
  messages: [{
    author: null,
    body: 'Press "Ctrl" to open this panel & "Esc" to unlock mouse',
    uid: null
  }],
  setLocked: locked => set(() => ({ locked })),
  setStatus: status => set(() => ({ status })),
  setCountdown: countdown => set(() => ({ countdown })),
  setMessages: countdown => set(() => ({ countdown })),
  addMessage: message => set(state => ({ 
    messages: [...state.messages, message]
  })),
}))

function Scene() {
  const { size, scene, camera } = useThree()
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  if (camera) return (
    <Effects>
      <renderPixelatedPass args={[resolution, 6, scene, camera]} />
    </Effects>
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

export let faceOwner = ''
export let stack = []
export let players = []
export let gameID = null

export default function index() {
  const [errMsg, setErrMsg] = useState()
  const [playersState, setPlayersState] = useState()
  const [stackState, setStackState] = useState()
  const setCountdown = useStore(state => state.setCountdown)
  const status = useStore(state => state.status)
  const addMessage = useStore(state => state.addMessage)
  const setStatus = useStore(state => state.setStatus)
  const router = useRouter()
  
  if (typeof localStorage === 'object') {
    // TODO: still will load models, due to preload on menu
    if (!localStorage.getItem('name')) router.push('/')
  }

  useEffect(() => {
    socket.on("join", ioPlayers => {
      const newPlayers = ioPlayers.filter(ioPlayer => players.every(player => player.uid !== ioPlayer.uid))
      for (const player of newPlayers) {
        // TODO: verify this doesn't erase ongoing deck size
        if (!player.deck) player.deck = []
        players.push(player)
      }
    })

    socket.on("leave", ioPlayer => {
      players = players.filter(p => p.uid !== ioPlayer.uid)
    })

    socket.on("err", code => {
      console.log('err', code)
    })

    socket.on("drop", data => {
      if (
        data.id
        && data.type === 'basic'
        && (data.key.includes('q') 
        || data.key.includes('k')
        || data.key.includes('j')
        || data.key.includes('a'))
      ) {
        console.log('new face owner', faceOwner, '->', data.id)
        faceOwner = data.id
      } else {
        console.log('ignoring drop', data.key)
      }
    })

    socket.on("status", status => {
      console.log('status ->', status)
      setCountdown(true)
      setStatus(status)
      setTimeout(() => setStatus(null), 5000)
    })
    
    socket.on('update', data => {
      console.log('update', data)
      players = data.players
      stack = data.stack
      if (data.State == 'start') {
        messageAll(`The game has begun! it is ${players[randIndex].name}'s turn. Take a seat if you haven't already with "Right mouse button" & then drop a card with "Left mouse button"`)
      }
      if (data.faceOwner) {
        faceOwner = data.faceOwner
      }
    })
    
    // socket.on('resetAll', () => { } ) // this logic has been moved to <Cards />
    // useStore.subscribe( store => {} ) // don't know of a way this is useful yet
    return () => {
      socket.off('status')
      socket.off('err')
      socket.off('leave')
      socket.off('drop')
      socket.off('join')
      socket.off('update')
      socket.off('deck-change')
    }
  }, [])

  useEffect(() => {
    // console.log("players", playersState)
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

  useEffect(() => {
    if (router && !players.length) router.push('/')
  }, [router])

  function messageAll(body) {
    const msgObj = { body }
    addMessage(msgObj)
    socket.emit('chat', msgObj)
  }

  function start() {
    if (players.length < 2) {
      setErrMsg('Not enough players')
      return
    }
    setStatus(null)


    // deals cards
    // const evenlyDealt = breakIntoParts(cardKeys.length, players.length)
    const evenlyDealt = breakIntoParts(process.env.NEXT_PUBLIC_DECK_SIZE, players.length)
    shuffleArr(cardNames)

    evenlyDealt.forEach((size, i) => {
      for (const j in [...Array(size).keys()]) {
        players[i].deck.push(cardNames.shift())
      }
    })

    // randomly select someone to go first
    const randIndex = Math.floor(Math.random()*players.length)
    players[randIndex].turn = true


    messageAll(`The game has begun! it is ${players[randIndex].name}'s turn. Take a seat if you haven't already with "Right mouse button" & then drop a card with "Left mouse button"`)

    socket.emit('update', { players, stack: [], state:'start' })
  }
  
  // logic fails
  // - left played a jack, right played last card and failed duel
  // - success slap by person out of cards failed to winStack
  // - failed to set status to ready after duel was won where loser dropped last card for last duel chance
  // - win does not sync (successful duel)


  function loop() {
    const me = players.find(p => p.uid == uid)
    if (!me.deck.length) {
      console.log('preventing turn, no cards')
      setErrMsg("you don't have any cards")
      return
    } else if (!me.turn) {
      console.log('preventing turn, its not your turn')
      setErrMsg('not your turn')
      return
    }
    if (status === 'froze') {
      console.log('preventing turn, the state is frozen')
      setErrMsg('you lost a duel')
      return
    }

    const card = me.deck[0]

    socket.emit('drop', {
      id: uid,
      key: card,
      type: "basic"
    })
    stack = [...stack, card]
    dropCard(card, "basic")
    me.deck.shift()

    let playedFace = false
    if (card.includes('j') || card.includes('k') || card.includes('q') || card.includes('a')) {
      console.log('found face card', card, 'either newSS or change to next')
      faceOwner = uid
      playedFace = true
      const withCards = players.filter(p => p.deck.length)
      if (withCards.length === 1) {
        newSS()
        return
      } else {
        // UNFORSEEN MESS not dry
        me.turn = false
        let index = players.findIndex(p => p.uid === uid) + 1
        if (index === players.length) {
          index = 0
        }
        console.log('setting next player ', players[index].name)
        players[index].turn = true
      }
    }

    let lostDuel = false
    let duel = false
    for (const [i, c] of [...stack].reverse().entries()) {
      if (i > 4) break
      // console.log('card check', i, c)
      if (
        i == 1 && c.includes('j')
        || i == 2 && c.includes('q')
        || i == 3 && c.includes('k')
        || i == 4 && c.includes('a')
      ) {
        // if (i == 1 && c.includes('j')) {
        //   console.log('lost on j')
        // }
        // if (i == 2 && c.includes('q')) {
        //   console.log('lost on q')
        // }
        // if (i == 3 && c.includes('k')) {
        //   console.log('lost on k')
        // }
        // if (i == 4 && c.includes('a')) {
        //   console.log('lost on a')
        // }
        // console.log('lost duel')
        if (!playedFace) lostDuel = true

        // check for ongoing duel
      }
      if (
        c.includes('q') 
        || c.includes('k')
        || c.includes('j')
        || c.includes('a')
      ) {
        duel = true
        console.log('Found duel card', card, 'at', i, 'from end. keeping turn state')
        break
      }
    }
    
    if (!playedFace && !duel) {
      // copy of played face
      // UNFORSEEN MESS
      console.log('not in duel and did not play a face')
      const withCards = players.filter(p => p.deck.length)
      if (withCards.length === 1) {
        newSS()
        return
      } else {
        me.turn = false
        let index = players.findIndex(p => p.uid === uid) + 1
        if (index === players.length) {
          index = 0
        }
        console.log('setting next player ', players[index].name)
        players[index].turn = true
      }
    }

    // UNFORSEEN MESS conditional
    if (!playedFace && duel && lostDuel) {
      newStacky()
      return
    } else {
      console.log('else lostDuel',me.deck.length, players.filter(p => p.deck.length).length)
      if (me.deck.length === 0) {
        if (players.filter(p => p.deck.length).length === 1) {
          newSS()
          return
        } else {
          console.log('setting new turn')
          me.turn = false
          let index = players.findIndex(p => p.uid === uid) + 1
          if (index === players.length) {
            index = 0
          }
          console.log('setting next player ', players[index].name)
          players[index].turn = true
        }
      }
    }
    socket.emit('update', { players, stack })
  }

  function newSS() {
    setStatus('froze')
    socket.emit('status', 'froze')
    setCountdown(true)
    console.log('starting end timmer')
    socket.emit('update', { players, stack })
    setTimeout(s => {
      // TODO: find a better way to check for if a successful slap happened
      console.log('5s timeout, check for game win')
      const withCards = players.filter(p => p.deck.length)
      if (stack.length < 2 || withCards.length > 1) {
        console.log('duel stolen')
        return
      }
      console.log(withCards[0].name + ' has won!')
      setErrMsg(withCards[0].name + ' has won!')
      messageAll(withCards[0].name + ' has won!')
      for (const p of players) {
        p.deck = []
        p.turn = false
      }
      stack = []
      setStatus('ready')
      socket.emit('update', { players, stack, state: 'end' })
    }, 5000, null)
  }

  function newStacky() {
    setStatus('froze')
    socket.emit('status', 'froze')
    setCountdown(true)
    console.log('starting stack win timmer')
    socket.emit('update', { players, stack })
    console.log('pre time stack owner', faceOwner)
    setTimeout(s => {
      // TODO: find a better way to check for if a successful slap happened
      console.log('5s timeout, check for stack win', faceOwner)
      if (stack.length < 2) {
        console.log('duel stolen')
        return
      }

      for (const p of players) {
        if (p.uid === faceOwner) {
          p.turn = true
          p.deck.push(...stack)
        } else {
          p.turn = false
        }
      }
      stack = []

      if (players.filter(p => p.deck.length).length === 1) {
        newSS()
        return
      }

      setStatus('ready')
      socket.emit('update', { players, stack, state: 'win' })
    }, 5000, null)
  }

  // function gameLoop() {
  //   const me = players.find(p => p.uid == uid)
  //   // TODO: deliver a message whenever returning
  //   if (!me.deck.length) {
  //     console.log('preventing turn, no cards')
  //     setErrMsg("you don't have any cards")
  //     return
  //   } else if (!me.turn) {
  //     console.log('preventing turn, its not your turn')
  //     setErrMsg('not your turn')
  //     return
  //   }
  //   if (status === 'froze') {
  //     // console.error('you cannot have a turn while a timer is running')
  //     console.log('preventing turn, the state is frozen')
  //     setErrMsg('you lost a duel')
  //     return
  //   }

  //   // assumes move is valid and server would not block action
  //   socket.emit('drop', {
  //     id: me.id,
  //     key: me.deck[0],
  //     type: "basic"
  //   })
  //   dropCard(me.deck[0], "basic")

  //   // see if the hand was lost
    
  //   // critical points
  //   // counter is at 0 (no face dropped)
  //   // counter starts (face dropped)
  //   // ran out of cards ()

  //   stack = [...stack, me.deck[0]]
    
  //   // check if Jack, Queen, King, or Ace
  //   let face = false
  //   let duel = false
  //   let lostDuel = false

  //   if (me.deck[0].includes('j') ||
  //       me.deck[0].includes('k') ||
  //       me.deck[0].includes('q') ||
  //       me.deck[0].includes('a')) {
  //     console.log('found face card')
  //     face = true
  //     faceOwner = uid
  //   } else {
  //     // check to see if duel failed
  //     // console.log('check for duel in stack', stack, faceOwner)
  //     for (const i in stack) {
  //       if (i > 3) break
  //       const endIndex = (Number(i) + 2) * -1
  //       const card = stack.at(endIndex)
  //       // console.log('card', card, 'at', i, 'from end')
  //       if (!card) {
  //         console.log('skipping stack check because no card at index', endIndex, stack)
  //         continue
  //       }

  //       // losing duel points
  //       if (i == 0 && card.includes('j') ||
  //           i == 1 && card.includes('q') ||
  //           i == 2 && card.includes('k') ||
  //           i == 3 && card.includes('a')) {
  //         lostDuel = true
  //       }

  //       // check for ongoing duel
  //       if (card.includes('q') ||
  //           card.includes('k') ||
  //           card.includes('a')) {
  //         duel = true
  //         console.log('Found duel card', card, 'at', i, 'from end. keeping turn state')
  //         break
  //       }
  //     }
  //   }
    
  //   if (lostDuel) {
  //     me.deck.shift()
  //     ss()
  //     setTimeout(stack => {
  //       // this has the stack info at start of duel which
  //       // could be used for a better check system
  //       console.log('5s timeout, check for stack win')
  //       winStack(faceOwner, 'duel')
  //     }, 5000, stack)
  //     return
  //   }

  //   // const tempStack = Array.from(stack)
  //   // tempStack.push(me.deck[0]) // push is mutable

  //   // possible end state check, prev player played their last extended face
  //   const withCardsBeforeDrop = players.filter(p => p.deck.length)
  //   if (withCardsBeforeDrop.length === 1) {
  //     console.log('extended face block', withCardsBeforeDrop.length, !duel)
  //   }
  //   if (withCardsBeforeDrop.length === 1 && !duel) {
  //     me.deck.shift()
  //     ss()
  //     setTimeout(stack => {
  //       console.log('extended face replaced with last player duel')
  //       endGame(withCardsBeforeDrop[0].uid)
  //     }, 5000, stack)
  //     return
  //   }

  //   me.deck.shift()

  //   // change turn if played face, no cards, or a duel isnt happening
  //   if (face || !me.deck.length || !duel) {
  //     console.log('face', face, ' || out of cards', me.deck.length, '|| !duel', !duel)

  //     // only include people with cards as those who can have a turn
  //     const withCards = players.filter(p => p.deck.length)

  //     if (!me.deck.length) {
  //       console.log('out of cards, alerting chat')
  //       setErrMsg("Out of cards")
  //       messageAll(me.name + " is out of cards")
  //     }

  //     if (withCards.length < 2 && !me.deck.length && !face) {
  //       ss()
  //       console.log('freezing since last player and I have no cards and There wasnt a face card')
  //       setTimeout(stack => {
  //         console.log('triggered end game because you played your last card')
  //         endGame(withCards[0].uid)
  //       }, 5000, stack)

  //       return
  //     }
      
  //     // TODO: there is a new player prop called 'order'. This could be used for
  //     // deciding turn order
  //     // NOTE: changing the withCards array will update players array
      
  //     let index = withCards.findIndex(p => p.turn == true)
  //     if (index === -1) {
  //       // played last card
  //       me.turn = false
  //     } else {
  //       withCards[index].turn = false
  //     }
  //     if (withCards.length == 1) {
  //       console.log('setting next player to last player', withCards[0].name)
  //       withCards[0].turn = true 
  //     } else {
  //       if (index == withCards.length - 1) {
  //         index = -1
  //       }
  //       console.log('setting next player ', players[index + 1].name)
  //       players[index + 1].turn = true
  //     }
  //   }
  //   socket.emit('update', { players, stack, faceOwner: face ? faceOwner : "" })
  // }

  function slapWin() {
    // MORBIN TIME
    for (const p of players) {
      if (p.uid === uid) {
        p.turn = true
        p.deck.push(...stack)
      } else {
        p.turn = false
      }
    }
    stack = []

    if (players.filter(p => p.deck.length).length === 1) {
      console.log('likely won off of slap')
      newSS()
      return
    }
    
    socket.emit('update', { players, stack, state: 'win' })
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
        slapWin()
        return
      }
  
      // sandwich
      if (stack.length > 2) {
        // console.log('sandwich compare', latestType, stack.at(-3).charAt(0))
        if (latestType == stack.at(-3).charAt(0)) {
          // console.log('SANDWICH slap of type', latestType)
          slapWin()
          return
        }
      }
    }
    setErrMsg('bad slap')

    // burn 2 cards
    const me = players.find(p => p.uid == uid)
    if (me.deck.length === 0) return
    let key = me.deck.shift()
    socket.emit('drop', {
      id: uid,
      key,
      type: 'firstBurn'
    })
    dropCard(key, "firstBurn")
    stack = [key, ...stack]

    if (me.deck.length > 0) {
      
      key = me.deck.shift()
      
      socket.emit('drop', {
        id: uid,
        key,
        type: 'secondBurn',
      })
      
      dropCard(key, 'secondBurn')
      
      stack = [key, ...stack]
    }

    if (me.deck.length === 0) {

      const withCards = players.filter(p => p.deck.length)
      if (withCards.length === 1) {
        console.log('triggering end game due to bad slap')
        newSS()
        return
      }

      if (me.turn) {
        me.turn = false
        let index = players.findIndex(p => p.uid === uid) + 1
        if (index === players.length) {
          index = 0
        }
        console.log('setting next player ', players[index].name)
        players[index].turn = true
      }

      
    }
    socket.emit('update', { players, stack })
  }

  // function endGame(winnerID) {
  //   // check if someone did a successful slap
  //   const withCards = players.filter(p => p.deck.length)
  //   console.log('end check, players with cards', withCards)
  //   if (withCards.length > 1) return false

  //   // check for extended play stack win
  //   const me = players.find(p => p.uid == uid)
  //   if (me.deck.length === 0) {
  //     console.log('you won the battle but not the war...yet')
  //     return false
  //   }
    
  //   for (const i in players) {
  //     if (players[i].uid == winnerID) {
  //       console.log(players[i].name + ' has won!')
  //       setErrMsg(players[i].name + ' has won!')
  //       messageAll(players[i].name + ' has won!')
  //     }
  //     players[i].deck = []
  //     players[i].turn = false
  //   }
  //   stack = []
  //   setStatus('ready')
  //   socket.emit('update', { players, stack, state: 'end' })
  //   return true
  // }

  // function winStack(winnerUID, type) {

  //   // TODO: do a better check on if a slap stole the pile
  //   // this check will not work if the goes goes too fast
  //   if (type == 'duel') {
  //     if (stack.length < 2) {
  //       console.log('duel stolen')
  //       return
  //     }
  //   }

  //   console.log('stack win check', players, 'but first check for end game win', winnerUID)

  //   // check for game end
  //   // console.log('checking end state after a stack was won', winnerUID)
  //   if (endGame(winnerUID)) return

  //   // remove whoever had turn before
  //   let index = players.findIndex(p => p.turn == true)
  //   if (index !== -1) {
  //     players[index].turn = false
  //   }

  //   for (const i in players) {
  //     if (players[i].uid == winnerUID) {
  //       console.log('setting duel winner', players[i].name, 'adding', stack.length, 'cards')
  //       players[i].turn = true // set it to my turn
  //       players[i].deck.push(...stack) // mutable
  //     }
  //   }

  //   stack = []
  //   socket.emit('update', { players, stack: [], state: 'win' })
  // }

  // TODO: this likely delays first paint
  if (!players.length) return <Load />
  
  return (
    <>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
          { name: "run", keys: ["Shift"] },
        ]}>
        <Suspense fallback={<Load />}>
          <Canvas shadows camera={{ fov: 50 }} style={{height: '100vh'}}>
            {/* <Stats showPanel={1} /> */}
            {/* <Perf /> */}
            {/* <Sky sunPosition={[100, 20, 100]} distance={5000} /> */}
            {/* <color attach="background" args={['#000000']} /> */}
            <ambientLight intensity={.4} />
            <pointLight  castShadow intensity={2} position={[20, 50, 0]}  color="#5A5233" />
            <directionalLight castShadow intensity={2} position={[30, 200, 49]}  />
            <Physics colliders={false} gravity={[0,-1,0]}>
                <Ground />
                <PlayersAndChairs slap={slap} gameLoop={loop} players={playersState} />
                <Table />
                <Room />
                <Cards />
                {/* <Text position={[-.4,2,1.6]} rotation={[-Math.PI /2,0,0]} text="Change Turn" /> */}
                <TextMesh position={[0, 2.2, 0]} rotation={[0,0,0]} scale={1} players={playersState} text="Start" spin />
                {/* <Text position={[1.6,2,.2]} rotation={[-Math.PI /2,0,Math.PI /2]} text="Reset" /> */}
                {/* <Text position={[-1.6,2,-.3]} rotation={[-Math.PI /2,0,-Math.PI /2]} text={errMsg} /> */}
                <TextMesh position={[-.15, 2, -.9]} rotation={[-Math.PI /2,0,0]} scale={.5} text={errMsg} setText={setErrMsg} players={playersState} />
                {/* <TurnText players={playersState} /> */}
                <Timer />
                {/* <CardInfo stack={stackState} /> */}
                {/* <PlayerText players={playersState} /> */}
                {/* <Scene2 /> */}
                {/* <Scene /> */}
                {/* <Debug /> */}
                <Button position={[0, 2, 0]} action={start} color="green" players={playersState} />
                {/* <Button position={[0, 2, 1.8]} action={nextTurn} color="yellow" /> */}
                {/* <Button position={[1.8, 2, 0]} action={() => socket.emit('reset')} color="red" /> */}
                {/* <Button position={[-1.8, 2, 0]} action={() => console.log(players)} color="blue" /> */}
            </Physics>
            <PointerLockControls />
            <Preload all />
          </Canvas>
        </Suspense>
      </KeyboardControls>
      <UI players={playersState} />
    </>
  )
}