import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MitoPassportProvider } from '@/state/MitoPassportContext'
import { HomePage } from '@/pages/HomePage'
import { InputPage } from '@/pages/InputPage'
import { ResultPage } from '@/pages/ResultPage'

function App() {
  return (
    <BrowserRouter>
      <MitoPassportProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MitoPassportProvider>
    </BrowserRouter>
  )
}

export default App
