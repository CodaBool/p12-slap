import { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default function MyModal({name, setName}) {
  const [nameError, setNameError] = useState('')
  const [tempName, setTempName] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('name')) {
      setShow(true)
    } else {
      setName(localStorage.getItem('name'))
    }
  }, [])

  function handleName(e) {
    if (e.target.value.length > 11) {
      setNameError('Names must be max 12 characters')
    } else if (e.target.value.length == 0) {
      setNameError('Please Enter a Name')
      setTempName('')
    } else {
      setNameError(null)
      const char = e.target.value.slice(-1)
      if (char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z' || char == ' ') {
        console.log('set tempname to', e.target.value)
        localStorage.setItem('name', e.target.value)
        setTempName(e.target.value)
      } else {
        setNameError('Only letter characters Allowed')
      }
    }
  }

  function handleClose() {
    console.log('got close event', tempName, '->', name)
    if (name.length > 0) {
      setName(tempName)
      setShow(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Enter a Name</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-danger">{nameError}</p>
        <Form.Control className="" value={tempName} placeholder="Name" onChange={handleName} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" className="w-100" disabled={tempName.length == 0} onClick={() => setShow(false)}>Play</Button>
      </Modal.Footer>
    </Modal>
  )
}