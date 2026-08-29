import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
import { configureApiClient } from './lib/api'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'aos/dist/aos.css'
import './main.css'

configureApiClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
