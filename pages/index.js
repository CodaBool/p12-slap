import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import { useRouter } from 'next/router'
import Modal from '../components/Modal'
import Background from '../components/Background'
import { socket, ROOM_CHAR_SIZE, Player } from '../constants'
import useScreen from '../constants/useScreen'
import { players } from './game'
import { io } from 'socket.io-client'

export const uid = Math.random().toString(16).slice(2)

export default function index() {
  const [name, setName] = useState()
  const [rkey, setRkey] = useState('')
  const [wins, setWins] = useState()
  const [error, setError] = useState()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showBtn, setShowBtn] = useState(true)
  const [sock, setSock] = useState()
  const [inp, setInp] = useState('')
  const router = useRouter()
  let screen = useScreen()
  
  useEffect(() => {
    if (localStorage.getItem('wins')) {
      setWins(localStorage.getItem('wins'))
    }
    if (!localStorage.getItem('name')) {
      setShow(true)
    } else {
      setName(localStorage.getItem('name'))
    }
    // TODO: find out if this is too expensive
    // router?.prefetch('/game')
    // socket.on("init", id => {
    //   if (players.length === 0) {
    //     // name, uid, id, order
    //     const me = new Player(localStorage.getItem('name'), uid, id, 1)
    //     players.push(me)
    //     setLoading(true)
    //     // TODO: this should be done based on btn event click
    //     if (rkey?.length === ROOM_CHAR_SIZE) {
    //       socket.emit('join', { rkey, id: me.id })
    //     } else {
    //       router.push({
    //         pathname: '/game',
    //         query: { id }
    //       })
    //     }
    //   }
    // })

    // socket.on("join", ioPlayers => {
    //   for (const player of ioPlayers) {
    //     if (player.uid !== uid) {
    //       if (!player.deck) player.deck = []
    //       players.push(player)
    //     } else {
    //       const me = players.find(p => p.uid == uid)
    //       const index = players.indexOf(me)
    //       if (index > -1) {
    //         player.deck = []
    //         players.splice(index, 1)
    //         players.push(player)
    //       }
    //     }
    //   }
    //   router.push({
    //     pathname: '/game',
    //     query: { id: rkey }
    //   })
    // })
    // return () => {
    //   socket.off("init")
    //   socket.off("join")
    // }
  }, [rkey])

  useEffect(() => {
    // if (hourInEST > 0 && hourInEST < process.env.NEXT_PUBLIC_HOUR) {
    //   router.push('/offline')
    // }//
    // socket.on("connect_error", (err) => {
    //   console.log('connect_error due to', err);
    // })
    console.log('domain', process.env.NEXT_PUBLIC_SOCKET_DOMAIN)
    // return () => {
    //   socket.off("connect_error")
    // }
  }, [])
  useEffect(() => {
    // if (hourInEST > 0 && hourInEST < process.env.NEXT_PUBLIC_HOUR) {
    //   router.push('/offline')
    // }//
    if (inp) {
      console.log('attempt with', inp)
      setSock(io.connect(inp))
    }
    
  }, [inp])
  useEffect(() => {
    // if (hourInEST > 0 && hourInEST < process.env.NEXT_PUBLIC_HOUR) {
    //   router.push('/offline')
    // }//
    if (sock) {
      console.log('sock connected =', sock.connected)
      sock.on("connect_error", (err) => {
        console.log('connect_error due to', err);
      })
      sock.on("conn", () => {
        console.log('connection');
      })
      sock.emit('init', {name: localStorage.getItem('name'), uid})
    }
    return () => {
      if (sock) {
        sock.off("init")
        sock.off("conn")
        sock.off("connect_error")
      }
    }
  }, [sock])
  function initialize() {
    setShowBtn(false)
    console.log('socket', socket)
    socket.emit('init', {name: localStorage.getItem('name'), uid})
  }

  function handleCode(e) {
    if (e.target.value.length > ROOM_CHAR_SIZE) {
      setError(`Codes must be ${ROOM_CHAR_SIZE} characters long`)
    } else {
      setError(null)
    }
    setRkey(e.target.value)
  }

  const popover = (
    <Popover>
      <Popover.Header as="h3" className="text-center" style={{color: 'black'}}>Join or Create</Popover.Header>
      <Popover.Body style={{fontSize: '1.5em'}}>
        { showBtn && 
          <>
            &emsp;<strong>Join</strong> a room which someone has already created and provided you a {ROOM_CHAR_SIZE} character code for to join
            <Form.Control className="my-3" value={rkey} placeholder={`${ROOM_CHAR_SIZE} Character Code`} onChange={handleCode} />
            {error && <p className="text-danger text-center">{error}</p>}
            <Button onClick={initialize} className="w-100 my-1" disabled={rkey?.length !== ROOM_CHAR_SIZE || error || name?.length == 0}>Join with Code</Button>
            <hr />
            &emsp;<strong>Create</strong> a new room which generates a {ROOM_CHAR_SIZE} character code for you to provide to another player to join
            <Button onClick={initialize} disabled={error || name?.length == 0} className="w-100 mt-3">Create New Room</Button>
          </>
        }
        {
          !showBtn && (loading ? <h1>Loading <Spinner animation="border" variant="info"/></h1> : <h3>Joining Game 😎</h3>)
        }
      </Popover.Body>
    </Popover>
  )

  return (
    <>
      <Background />
      <input onChange={e => setInp(e.target.value)} />
      <div className="menuPage">
        <Row className="pt-5 m-0">
          <Col>
            <Button size="lg" className="nameButton ms-auto d-block" onClick={() => setShow(true)}>{name ? name : 'Click to Enter Name'}</Button>
            {wins && <Button size="lg" className="leftOtherButton my-3 ms-auto d-block">{wins ? wins : '0'} Wins</Button>}
          </Col>
          <Col>
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
              <Button size="lg" disabled={name?.length == 0} className="playButton" variant="success">Play</Button>
            </OverlayTrigger>
            <Button  className="rightOtherButton my-3 me-auto d-block" onClick={() => router.push('/about')} variant="outline-info">About</Button>
          </Col>
        </Row>
        <Row className="p-0 m-0">
          <h1 className="text-center display-1 w-100" style={{fontSize: `${screen.includes('m') ? '8rem' : '18rem'}`}}>SLAP</h1>
        </Row>
        <Modal name={name} setName={setName} show={show} setShow={setShow} />
      </div>
    </>
  )
}