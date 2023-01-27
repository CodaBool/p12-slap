import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useRouter } from 'next/router'
import Modal from '../components/Modal'
import Background from '../components/Background'
import { socket } from '../constants'
import useScreen from '../constants/useScreen'

export const uid = Math.random().toString(16).slice(2)

export default function index() {
  const [name, setName] = useState()
  const [id, setID] = useState('')
  const [wins, setWins] = useState()
  const [error, setError] = useState()
  const [show, setShow] = useState(false)
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
  }, [])

  useEffect(() => {
    // Prefetch the game page
    router.prefetch('/game')
  }, [])

  function createGame() {
    if (name && localStorage.getItem('name')) {
      router.push('/game')
    }
  }

  function joinGame() {
    if (name && localStorage.getItem('name') && id) {
      router.push({
        pathname: '/game',
        query: { id }
      })
    }
  }

  function handleCode(e) {
    if (e.target.value.length > 6) {
      setError('Codes must be 6 characters long')
    } else {
      setError(null)
    }
    setID(e.target.value)
  }

  const popover = (
    <Popover>
      <Popover.Header as="h3" className="text-center" style={{color: 'black'}}>Join or Create</Popover.Header>
      <Popover.Body style={{fontSize: '1.5em'}}>
        &emsp;<strong>Join</strong> a room which someone has already created and provided you a 6 character code for to join
        <Form.Control className="my-3" value={id} placeholder="6 Character Code" onChange={handleCode} />
        {error && <p className="text-danger text-center">{error}</p>}
        <Button onClick={joinGame} className="w-100 my-1" disabled={id?.length !== 6 || error || name?.length == 0}>Join with Code</Button>
        <hr />
        &emsp;<strong>Create</strong> a new room which generates a 6 character code for you to provide to another player to join
        <Button onClick={createGame} disabled={error || name?.length == 0} className="w-100 mt-3">Create New Room</Button>
      </Popover.Body>
    </Popover>
  )

  return (
    <>
      <Background />
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