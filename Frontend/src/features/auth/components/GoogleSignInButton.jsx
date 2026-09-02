import React, { useEffect, useRef } from 'react'
import { useAuth } from '../hook/useAuth'

const GoogleSignInButton = () => {
  const buttonRef = useRef(null)
  const { handleGoogleLogin } = useAuth()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    let intervalId = null
    let initialized = false

    const tryInit = () => {
      if (initialized) return
      if (!window.google?.accounts?.id) return

      initialized = true

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          handleGoogleLogin(response.credential)
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 340,
      })

      if (intervalId) clearInterval(intervalId)
    }

    tryInit()
    if (!initialized) {
      intervalId = setInterval(tryInit, 200)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return <div ref={buttonRef} className="flex justify-center" />
}

export default GoogleSignInButton