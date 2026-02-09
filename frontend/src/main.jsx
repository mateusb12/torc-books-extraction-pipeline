import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🟢 GLOBAL STYLE RESET 🟢 */}
    <style>{`
      body {
        margin: 0;
        padding: 0;
        background-color: #1a1a1a;
      }
    `}</style>

    <App />
  </React.StrictMode>,
)