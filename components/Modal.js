import { useState, useEffect, useRef } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default function MyModal({name, setName, show, setShow}) {
  const [nameError, setNameError] = useState('')
  const ref = useRef()

  useEffect(() => {
    if (!localStorage.getItem('name')) {
      setShow(true)
    } else {
      setName(localStorage.getItem('name'))
    }
  }, [])

  useEffect(() => {
    if (show) ref?.current.focus()
  }, [show])

  function handleName(e) {
    if (e.target.value.length > 11) {
      setNameError('Names must be max 12 characters')
    } else if (e.target.value.length == 0) {
      setNameError('Please Enter a Name')
      setName('')
    } else {
      setNameError(null)
      const char = e.target.value.slice(-1)
      if (char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z' || char == ' ') {
        localStorage.setItem('name', e.target.value)
        setName(e.target.value)
      } else {
        setNameError('Only letter characters Allowed')
      }
    }
  }

  function handleClose() {
    if (name?.length > 0) {
      setShow(false)
    }
  }

  function checkForEnter(e) {
    if (e.key == 'Enter') {
      handleClose()
    }
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title style={{color: 'black'}}>Enter a Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-danger">{nameError}</p>
        <Form.Control className="" ref={ref} value={name ? name : ''} placeholder="Name" onChange={handleName} onKeyDown={checkForEnter} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" className="w-100" disabled={name?.length == 0} onClick={handleClose}>Save</Button>
      </Modal.Footer>
    </Modal>
  )
}