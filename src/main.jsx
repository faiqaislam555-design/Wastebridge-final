import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress THREE.Clock deprecation from @react-three/fiber internals
const _warn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
  _warn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
