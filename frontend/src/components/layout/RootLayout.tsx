import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AmbientBackground } from './AmbientBackground'
import { ToastContainer } from '@/components/ui'

export const RootLayout: React.FC = () => {
  const location = useLocation()
  const isWorkspace = location.pathname.startsWith('/workspace')

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-transparent text-text selection:bg-accent/20 selection:text-text">
      <AmbientBackground />
      <Navbar />
      <ToastContainer />

      <main className="flex-1 w-full pt-16 flex flex-col relative z-10 bg-transparent">
        <Outlet />
      </main>

      {!isWorkspace && <Footer />}
    </div>
  )
}
