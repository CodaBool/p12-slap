import Head from 'next/head'
import Container from 'react-bootstrap/Container'
import Navigation from '../components/Navigation'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Template App</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="A template app built on Nextjs" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="apple-touch-icon" href="/icon.gif" />
        <link rel="icon" href="/icon.gif" />
      </Head>
      {/* <Navigation /> */}
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}