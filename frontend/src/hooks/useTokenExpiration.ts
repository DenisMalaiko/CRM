import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/auth/authSlice'
import { toast } from 'react-toastify'

const TOKEN_EXPIRY_BUFFER_MS = 30_000

type JwtPayload = {
  exp: number
}

function parseTokenExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload: JwtPayload = JSON.parse(atob(base64))
    return payload.exp ?? null
  } catch {
    return null
  }
}

export function useTokenExpiration() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector((state) => state.authModule.accessToken)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!accessToken) return

    const exp = parseTokenExp(accessToken)
    if (exp === null) return

    const msUntilExpiry = exp * 1000 - Date.now() - TOKEN_EXPIRY_BUFFER_MS

    if (msUntilExpiry <= 0) {
      dispatch(logout())
      toast.info('Session expired. Please sign in again.')
      return
    }

    timerRef.current = setTimeout(() => {
      dispatch(logout())
      toast.info('Session expired. Please sign in again.')
    }, msUntilExpiry)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [accessToken, dispatch])
}
