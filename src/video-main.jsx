import React from 'react'
import ReactDOM from 'react-dom/client'
import VideoApp from './VideoApp'
import './index.css' // Reuse existings styles (Tailwind)

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <VideoApp />
    </React.StrictMode>,
)
