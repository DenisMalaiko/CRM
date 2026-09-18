import { renderHook, act } from '@testing-library/react'
import { useLanguage } from './useLanguage'

// ── Mocks ─────────────────────────────────────────────────────────────────────

let mockIsAuthenticated: boolean = false
const mockChangeLanguage = jest.fn()
const mockUpdateLanguage = jest.fn()

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: (...args: unknown[]) => mockChangeLanguage(...args),
    },
  }),
}))

jest.mock('../store/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ authModule: { isAuthenticatedUser: mockIsAuthenticated } }),
}))

jest.mock('../store/auth/authApi', () => ({
  useUpdateLanguageMutation: () => [(...args: unknown[]) => mockUpdateLanguage(...args)],
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAuthenticated = false
    localStorage.clear()
  })

  it('returns currentLanguage and changeLanguage', () => {
    const { result } = renderHook(() => useLanguage())

    expect(result.current.currentLanguage).toBe('en')
    expect(typeof result.current.changeLanguage).toBe('function')
  })

  it('changes i18n language when changeLanguage is called', () => {
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.changeLanguage('uk')
    })

    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('uk')
  })

  it('saves language to localStorage when changeLanguage is called', () => {
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.changeLanguage('uk')
    })

    expect(localStorage.getItem('language')).toBe('uk')
  })

  it('calls API mutation when user is authenticated', () => {
    mockIsAuthenticated = true
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.changeLanguage('uk')
    })

    expect(mockUpdateLanguage).toHaveBeenCalledTimes(1)
    expect(mockUpdateLanguage).toHaveBeenCalledWith({ language: 'uk' })
  })

  it('does NOT call API mutation when user is NOT authenticated', () => {
    mockIsAuthenticated = false
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.changeLanguage('uk')
    })

    expect(mockUpdateLanguage).not.toHaveBeenCalled()
  })

  it('still changes i18n language and localStorage even when user is not authenticated', () => {
    mockIsAuthenticated = false
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.changeLanguage('de')
    })

    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    expect(localStorage.getItem('language')).toBe('de')
  })
})
