'use server'
import { signIn, signOut } from '@/auth'

export const handleSignIn = async () => {
  await signIn()
}

export const handleSignOut = async () => {
  await signOut()
}
