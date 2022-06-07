import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Background from '../components/Background'
import Form from '../components/Form'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Tweet Interactions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Background />

        <Form />
      </main>
      
    </div>
  )
}


export default Home
