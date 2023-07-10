import { useRouter } from 'next/router'

export default function about() {
  const router = useRouter()

  return (
    <div onClick={() => router.push('/')} style={{cursor: 'pointer'}}>click here to go back</div>
  )
}
