import { Metadata } from 'next'
import { Suspense } from 'react'
import Form from './Form'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function Signin() {
  return <Suspense><Form /></Suspense>
}
