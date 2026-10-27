import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout'
import { LandingPage, WorkspacePage, ExamplesPage, NotFoundPage } from '@/routes'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="examples" element={<ExamplesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
