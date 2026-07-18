import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NewsletterPopup from './components/NewsletterPopup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <NewsletterPopup />
    </>
  </StrictMode>,
)
