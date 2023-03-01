import { useRouter } from 'next/router'
import {useState} from 'react'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Background from '../components/Background'

const intlDateObj = new Intl.DateTimeFormat('en-US', {hour: '2-digit', hour12: false, timeZone: "America/New_York"})

export default function offline() {
  // gives hour from 0-23 , type string
  const [hour, setHour] = useState(intlDateObj.format(new Date()))
  const router = useRouter()

  return (
    <>
      <Background />
      <h1 className="text-center display-4 mt-5">Server is offline for another {Math.abs(process.env.NEXT_PUBLIC_HOUR - hour)} hours</h1>
      <Row>
        <Button onClick={() => router.push('/')} variant="info" className="mx-auto w-25 mt-5">Retry</Button>
      </Row>
    </>
  )
}
