import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'
import './i18n';

// A simple loading component to show while translations are loading
const LoadingFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
    <p className="text-white text-lg">Loading...</p>
  </div>
);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>,
)