import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Import this
import App from './App'
import './styles/base.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* Wrap App with BrowserRouter to provide the routing context */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)