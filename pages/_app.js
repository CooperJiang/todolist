import '../styles/globals.css'
import React from 'react';
import Head from 'next/head'
import Baidu from '../components/baidu'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <Baidu/>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp;


