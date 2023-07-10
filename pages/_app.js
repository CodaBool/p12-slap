import Head from 'next/head'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Slap</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="Threejs card game table" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="apple-touch-icon" href="/icon.gif" />
        <link rel="icon" href="/icon.gif" />
      </Head>
      <main>
        {router.pathname.includes('/game') && <div className="dot" />}
        <Component {...pageProps} />
      </main>
    </>
  )
}