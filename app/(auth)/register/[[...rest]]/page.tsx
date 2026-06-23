import { Metadata } from 'next'
import { Suspense } from 'react'
import Form from './Form'

export const metadata: Metadata = {
  title: 'Register',
}

export default async function Register() {
  return <Suspense><Form /></Suspense>
}
