import { renderHook } from '@testing-library/react'
import { useTokenExpiration } from './useTokenExpiration'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn()

jest.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ authModule: { accessToken: mockAccessToken } }),
}))

const mockLogoutAction = { type: 'auth/logout' }

jest.mock('../store/auth/authSlice', () => ({
  logout: () => mockLogoutAction,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

// Mutable so individual tests can override it
let mockAccessToken: string | null = null

function buildToken(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: 'user-1', exp }))
  return `${header}.${payload}.signature`
}

function expInSeconds(offsetMs: number): number {
  return Math.floor((Date.now() + offsetMs) / 1000)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTokenExpiration', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockAccessToken = null
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does nothing when accessToken is null', () => {
    mockAccessToken = null
    renderHook(() => useTokenExpiration())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('dispatches logout immediately when token is already expired', () => {
    // exp 60 seconds in the past
    mockAccessToken = buildToken(expInSeconds(-60_000))
    renderHook(() => useTokenExpiration())
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(mockLogoutAction)
  })

  it('dispatches logout immediately when token expires within the 30s buffer', () => {
    // exp 10 seconds in the future — inside the 30s buffer, treated as already expired
    mockAccessToken = buildToken(expInSeconds(10_000))
    renderHook(() => useTokenExpiration())
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(mockLogoutAction)
  })

  it('sets a timer for future expiration and does not dispatch immediately', () => {
    // exp 2 minutes in the future — 90 seconds after the 30s buffer elapses
    mockAccessToken = buildToken(expInSeconds(120_000))
    renderHook(() => useTokenExpiration())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('dispatches logout when the timer fires', () => {
    const offsetMs = 120_000 // 2 minutes ahead
    mockAccessToken = buildToken(expInSeconds(offsetMs))
    renderHook(() => useTokenExpiration())

    // Advance just past the scheduled delay (offsetMs − 30 000 ms buffer)
    jest.advanceTimersByTime(offsetMs - 30_000 + 1)

    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith(mockLogoutAction)
  })

  it('clears the timer and does not dispatch when the hook unmounts before expiry', () => {
    mockAccessToken = buildToken(expInSeconds(120_000))
    const { unmount } = renderHook(() => useTokenExpiration())

    unmount()
    jest.advanceTimersByTime(200_000)

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('clears the existing timer when accessToken changes', () => {
    const firstOffset = 120_000
    mockAccessToken = buildToken(expInSeconds(firstOffset))

    const { rerender } = renderHook(() => useTokenExpiration())
    expect(mockDispatch).not.toHaveBeenCalled()

    // Swap to a new token with a different expiry before the first timer fires
    mockAccessToken = buildToken(expInSeconds(300_000))
    rerender()

    // Advance past the first token's scheduled delay — no dispatch should happen
    jest.advanceTimersByTime(firstOffset - 30_000 + 1)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does nothing when the token is malformed (not a valid JWT)', () => {
    mockAccessToken = 'this-is-not-a-jwt'
    renderHook(() => useTokenExpiration())
    jest.advanceTimersByTime(60_000)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does nothing when the JWT payload cannot be base64-decoded', () => {
    mockAccessToken = 'header.!!!invalid-base64!!!.signature'
    renderHook(() => useTokenExpiration())
    jest.advanceTimersByTime(60_000)
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does nothing when the JWT payload is missing the exp claim', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }))
    const payload = btoa(JSON.stringify({ sub: 'user-1' })) // no exp
    mockAccessToken = `${header}.${payload}.signature`
    renderHook(() => useTokenExpiration())
    jest.advanceTimersByTime(60_000)
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
