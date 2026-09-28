import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
import { SessionProvider } from './security/session'
import './main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'aos/dist/aos.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider><App /></SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
