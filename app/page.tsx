import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/auth'

export default async function HomePage() {
  // Check if user is authenticated
  const user = await getCurrentUserFromCookies()
  
  if (user) {
    // User is authenticated, redirect to dashboard
    redirect('/dashboard')
  } else {
    // User is not authenticated, redirect to login
    redirect('/login')
  }
}
