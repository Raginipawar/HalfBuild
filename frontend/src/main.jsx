import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CanvasProvider } from './components/Canvas'
import { startSmoothScroll } from './lib/smoothScroll'
import './index.css'

startSmoothScroll()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CanvasProvider>
        <App />
      </CanvasProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
