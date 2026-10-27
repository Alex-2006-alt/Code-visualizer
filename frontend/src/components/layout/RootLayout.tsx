import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { BackgroundCanvas } from './BackgroundCanvas'
import { ToastContainer } from '@/components/ui'

export const RootLayout: React.FC = () => {
  const location = useLocation()
  const isWorkspace = location.pathname.startsWith('/workspace')

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <BackgroundCanvas />
      <Navbar />
      <ToastContainer />

      <main className="flex-1 w-full pt-16 flex flex-col relative z-10">
        <Outlet />
      </main>

      {!isWorkspace && <Footer />}
    </div>
  )
}
