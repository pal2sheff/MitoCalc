import { HashRouter, Route, Routes } from 'react-router-dom'
import { MitoPassportProvider } from '@/state/MitoPassportContext'
import { HomePage } from '@/pages/HomePage'
import { InputPage } from '@/pages/InputPage'
import { ResultPage } from '@/pages/ResultPage'
import { DecisionsPage } from '@/pages/DecisionsPage'

function App() {
  return (
    <HashRouter>
      <MitoPassportProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
        </Routes>
      </MitoPassportProvider>
    </HashRouter>
  )
}

export default App
