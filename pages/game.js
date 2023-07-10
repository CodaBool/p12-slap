import { Canvas } from '@react-three/fiber'
import { useMemo, useEffect, Suspense, useState, useCallback } from 'react'
import { socket, breakIntoParts, shuffleArr, copy, cardNames } from '../constants'
import Table from '../components/three/Table'
import Room from '../components/three/Room'
import PlayersAndChairs from '../components/three/PlayerV2'
import UI from '../components/UI'
import Ground from '../components/three/Ground'
import { Physics } from "@react-three/rapier"
import { Effects, Preload, PointerLockControls, KeyboardControls } from '@react-three/drei'
import { create } from 'zustand'
import Button from '../components/three/Button'
import Cards, { dropCard } from '../components/three/CardsV2'
import { useRouter } from 'next/router'
import assert from 'assert'
import { uid } from './index'
import TextMesh, { Timer } from '../components/three/Text'
import {Load} from '../components/Load'

export const useStore = create(set => ({
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

export let faceOwner = ''
export let stack = []
export let players = []
export let gameID = null

export default function index() {
  const [errMsg, setErrMsg] = useState()
  const [playersState, setPlayersState] = useState()
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
        && (
          data.key.includes('q') 
          || data.key.includes('k')
          || data.key.includes('j')
          || data.key.includes('a')
        )
      ) {
        if (faceOwner !== data.id) {
          console.log('new face owner', faceOwner, '->', data.id)
        }
        faceOwner = data.id
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
    
    return () => {
      socket.off('status')
      socket.off('err')
      socket.off('leave')
      socket.off('drop')
      socket.off('join')
      socket.off('update')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        assert.deepEqual(players, playersState)
      } catch (err) {
        setPlayersState(copy(players))
      }
    }, 300)
    return () => clearInterval(interval)
  }, [playersState])

  useEffect(() => {
    if (status !== 'froze' || status === null) return
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
    const evenlyDealt = breakIntoParts(process.env.NEXT_PUBLIC_DECK_SIZE, players.length)
    shuffleArr(cardNames)

    evenlyDealt.forEach((size, i) => {
      for (const j in [...Array(size).keys()]) {
        players[i].deck.push(cardNames.shift())
      }
    })

    const randIndex = Math.floor(Math.random()*players.length)
    players[randIndex].turn = true

    messageAll(`The game has begun! it is ${players[randIndex].name}'s turn. Take a seat if you haven't already with "Right mouse button" & then drop a card with "Left mouse button"`)

    socket.emit('update', { players, stack: [], state:'start' })
  }

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
      console.log('found face card', card, 'either endCheck or change to next')
      faceOwner = uid
      playedFace = true
      const withCards = players.filter(p => p.deck.length)
      if (withCards.length === 1) {
        endCheck()
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
      if (
        i == 1 && c.includes('j')
        || i == 2 && c.includes('q')
        || i == 3 && c.includes('k')
        || i == 4 && c.includes('a')
      ) {
        if (!playedFace) lostDuel = true
      }
      if (
        c.includes('q') 
        || c.includes('k')
        || c.includes('j')
        || c.includes('a')
      ) {
        duel = true
        break
      }
    }
    
    if (!playedFace && !duel) {
      // copy of played face
      // UNFORSEEN MESS
      console.log('not in duel and did not play a face')
      const withCards = players.filter(p => p.deck.length)
      if (withCards.length === 1) {
        endCheck()
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
      winStack()
      return
    } else {
      console.log('else lostDuel',me.deck.length, players.filter(p => p.deck.length).length)
      if (me.deck.length === 0) {
        if (players.filter(p => p.deck.length).length === 1) {
          endCheck()
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

  function endCheck() {
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

  function winStack() {
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
        endCheck()
        return
      }

      setStatus('ready')
      socket.emit('update', { players, stack, state: 'win' })
    }, 5000, null)
  }

  function slapWin() {
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
      endCheck()
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
        endCheck()
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

  // TODO: this likely delays first paint
  if (!players.length || !localStorage?.getItem('name')) return <Load />
  
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
      <Suspense fallback={<Load />}>
        <Canvas shadows camera={{ fov: 50 }} style={{height: '100vh'}}>
          {/* <Stats showPanel={1} /> */}
          {/* <Perf /> */}
          <ambientLight intensity={.4} />
          <pointLight  castShadow intensity={2} position={[20, 50, 0]} color="#5A5233" />
          <directionalLight castShadow intensity={2} position={[30, 200, 49]} />
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
              <Timer />
              {/* <Scene2 /> */}
              {/* <Scene /> */}
              {/* <Debug /> */}
              <Button position={[0, 2, 0]} action={start} color="green" players={playersState} />
          </Physics>
          <PointerLockControls />
          <Preload all />
        </Canvas>
      </Suspense>
      <UI players={playersState} />
    </KeyboardControls>
  )
}