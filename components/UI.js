import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Overlay from 'react-bootstrap/Overlay'
import InputGroup from 'react-bootstrap/InputGroup'
import Tooltip from 'react-bootstrap/Tooltip'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useStore } from '../pages/game'
import { uid } from '../pages'
import { socket } from '../constants'

export default function UI({ players, reset }) {
  const [expanded, setExpanded] = useState(false)
  const [msg, setMsg] = useState('')
  const ref = useRef()
  const inputRef = useRef()
  const codeBtn = useRef()
  const [show, setShow] = useState(false)
  const [showErr, setShowErr] = useState(false)
  const router = useRouter()
  const messages = useStore(state => state.messages)
  const addMessage = useStore(state => state.addMessage)

  function keyEvent(e) {
    if (e.key === "Control") {
      toggleChat()
    }
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  function sendMessage(e) {
    if (e) e.preventDefault()
    if (msg === '') return
    const msgObj = {
      author: localStorage.getItem('name'),
      body: msg,
      uid
    }
    addMessage(msgObj)
    socket.emit('chat', msgObj)
    setMsg('')
  }

  function toggleChat() {
    setExpanded(prev => !prev)
  }

  useEffect(() => {
    window.addEventListener("keydown", keyEvent)
    return () => {
      window.removeEventListener("keydown", keyEvent)
    }
  }, [inputRef])

  useEffect(() => {
    if (inputRef?.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [expanded])

  function scrollEvent(event) {
    event.currentTarget.scroll({ top: event.currentTarget.scrollHeight, behavior: 'smooth' })
  }

  function handleMsg(e) {
    e.preventDefault()
    setMsg(e.target.value)
  }

  function copyCode(e) {
    const me = players.find(p => p.uid == uid)
    if (router?.query?.id) {
      setShow(true)
      navigator.clipboard.writeText(router?.query?.id)
      setTimeout(() => {
        setShow(false)
      }, 4000)
    } else if (me?.id) {
      setShow(true)
      navigator.clipboard.writeText(me?.id)
      setTimeout(() => {
        setShow(false)
      }, 4000)
    } else {
      setShowErr(true)
      setTimeout(() => {
        setShowErr(false)
      }, 4000)
    }
  }

  useEffect(() => {
    ref?.current?.addEventListener('DOMNodeInserted', scrollEvent)
    socket.on('chat', msg => {
      addMessage(msg)
    })
    return () => {
      ref?.current?.removeEventListener("DOMNodeInserted", scrollEvent)
      socket.off('chat')
    }
  }, [messages])

  // if (players?.length < 2) return

  function resetGame() {
    for (const p of players) {
      if (p.uid === uid) {
        console.log('sending msg =', `${p.name} has reset the game`)
        socket.emit('chat', {body: `${p.name} has reset the game`})
      }
      p.turn = false
      p.deck = []
    }
    socket.emit('update', {
      players,
      faceOwner: '',
      stack: [],
      state: 'win'
    })
  }

  return (
    <div className={`ui p-3 ${expanded == true ? 'ui-expanded' : ''}`}>
      <Row className="">
        <Col className="">
          <div className={`messages ${expanded == true ? 'messages-max' : 'messages-min'}`} ref={ref}>
            {messages?.length > 0 &&
              messages.map((message, index) => {
                if (message.uid === uid) {
                  return (
                    <p key={index} className="myMsg rounded text-right p-0 m-0">
                      <span className="yourName">{message.author && message.author + ': '}</span>
                      <span className=""> {message.body}</span>
                    </p>
                  )
                }
                return (
                  <p key={index} className="otherMsg p-0 m-0">
                    <span className="otherName">{message.author && message.author + ': '}</span>
                    <span className=""> {message.body}</span>
                  </p>
                )
              })
            }
          </div>
        </Col>
        <Col className="">
          {players?.length < 2
            ? <p style={{color: 'white'}}>Lobby is empty</p>
            : players?.length && players.map((p, index) => (
              <p key={index} className="p-0 m-0" style={{lineHeight: 1.5, opacity: 1, color: `${p.turn ? '#20ff00' : 'white'}`}}>{p.name ? p.name + ': ': ''}{p.deck?.length > 0 && `${p.deck.length}`}</p>
            ))
          }
          {expanded && 
            <>
              <Button ref={codeBtn} onClick={copyCode} variant="outline-primary" className="my-2 w-100" style={{fontSize: '1.3em'}}>Copy Share Code</Button>
              <Overlay target={codeBtn.current} show={show} placement="bottom">
                {props => (
                  <Tooltip id="overlay" {...props}>
                    <h4>Share Code <strong>{router.query.id ? router.query.id : players.find(p => p.uid == uid)[0]?.id}</strong> copied to clipboard!</h4> 
                  </Tooltip>
                )}
              </Overlay>
              <Overlay target={codeBtn.current} show={showErr} placement="bottom">
                {props => (
                  <Tooltip id="overlay" {...props}>
                    <h4>Failed to initialize, no share ID was found.</h4> 
                  </Tooltip>
                )}
              </Overlay>
              <Button onClick={() => router.reload("/")} variant="outline-danger" className="mb-2 w-100" style={{fontSize: '1.3em'}}>Return to Menu</Button>
              <Button onClick={resetGame} variant="outline-danger" className="mb-2 w-100" style={{fontSize: '1.3em'}}>Reset Game</Button>
            </>
          }
        </Col>
      </Row>
      {expanded && <Row className="">
        <Form onSubmit={sendMessage}>
          <InputGroup>
            <Form.Control placeholder="Enter Message" value={msg} onChange={handleMsg} onClick={e => e.preventDefault()} ref={inputRef} style={{backgroundColor: 'black', color: 'white', border: '1px solid grey'}} />
            <InputGroup.Text onClick={sendMessage} style={{ cursor: 'pointer', backgroundColor: 'black', color: 'white', border: '1px solid grey' }}>Send</InputGroup.Text>
          </InputGroup>
        </Form>
      </Row>}
    </div>
  )
}
