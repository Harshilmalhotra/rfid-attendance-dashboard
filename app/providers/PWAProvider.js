'use client'

import { useEffect } from 'react'

export default function PWAProvider({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful:', registration.scope)
          })
          .catch((err) => {
            console.log('ServiceWorker registration failed:', err)
          })
      })
    }
  }, [])

  return children
}