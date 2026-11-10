import { renderHook } from '@testing-library/react'
import { useGoogleFonts } from './useGoogleFonts'

// ── Notes on the module-level `loadedFonts` Set ───────────────────────────────
// The hook stores loaded font names in a module-level Set that persists for the
// lifetime of the Jest worker. Each test uses distinct fonts from GOOGLE_FONTS
// to avoid cross-test interference. Tests that verify deduplication behaviour
// rely on the DOM state (cleared in beforeEach) together with the Set.

function getHeadLinks(): HTMLLinkElement[] {
  return Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGoogleFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('appends a stylesheet link to document.head for a known Google Font', () => {
    renderHook(() => useGoogleFonts(['Inter']))

    const links = getHeadLinks()
    expect(links).toHaveLength(1)
    expect(links[0].href).toContain('fonts.googleapis.com')
    expect(links[0].href).toContain('family=Inter')
  })

  it('builds the correct Google Fonts URL format', () => {
    renderHook(() => useGoogleFonts(['Roboto']))

    const link = getHeadLinks()[0]
    expect(link.href).toBe(
      'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap'
    )
  })

  it('encodes spaces in font names as plus signs in the URL', () => {
    renderHook(() => useGoogleFonts(['Open Sans']))

    const link = getHeadLinks()[0]
    expect(link.href).toContain('family=Open+Sans')
  })

  it('loads multiple Google Fonts in a single link element', () => {
    renderHook(() => useGoogleFonts(['Lato', 'Montserrat']))

    const links = getHeadLinks()
    expect(links).toHaveLength(1)
    expect(links[0].href).toContain('family=Lato')
    expect(links[0].href).toContain('family=Montserrat')
  })

  it('ignores system fonts — does not append a link', () => {
    renderHook(() => useGoogleFonts(['Arial', 'Georgia']))

    expect(getHeadLinks()).toHaveLength(0)
  })

  it('ignores generic fonts — does not append a link', () => {
    renderHook(() => useGoogleFonts(['sans-serif', 'serif']))

    expect(getHeadLinks()).toHaveLength(0)
  })

  it('filters out unrecognised font names and only loads known Google Fonts', () => {
    renderHook(() => useGoogleFonts(['Poppins', 'UnknownFont', 'Arial']))

    const links = getHeadLinks()
    expect(links).toHaveLength(1)
    expect(links[0].href).toContain('family=Poppins')
    expect(links[0].href).not.toContain('UnknownFont')
    expect(links[0].href).not.toContain('Arial')
  })

  it('does not append any link when given an empty array', () => {
    renderHook(() => useGoogleFonts([]))

    expect(getHeadLinks()).toHaveLength(0)
  })

  it('filters out empty strings from the families array', () => {
    // Cast needed to simulate runtime data that may contain empty strings
    renderHook(() => useGoogleFonts(['Raleway', '', 'Nunito'] as string[]))

    const links = getHeadLinks()
    expect(links).toHaveLength(1)
    expect(links[0].href).toContain('family=Raleway')
    expect(links[0].href).toContain('family=Nunito')
    expect(links[0].href).not.toContain('family=:wght')
  })

  it('does not append a duplicate link when the same families key is re-rendered', () => {
    // The hook compares a sorted key; when the key is unchanged the effect bails.
    let families = ['Oswald']
    const { rerender } = renderHook(() => useGoogleFonts(families))

    // DOM has 1 link; now clear it and re-render — the hook short-circuits,
    // so no new link is added (proving the key comparison, not the Set).
    document.head.innerHTML = ''
    families = ['Oswald']
    rerender()

    expect(getHeadLinks()).toHaveLength(0)
  })

  it('does not append a duplicate link when families list is reordered', () => {
    // The hook sorts before building the key, so order changes are ignored.
    let families = ['Playfair Display', 'Merriweather']
    const { rerender } = renderHook(() => useGoogleFonts(families))
    document.head.innerHTML = ''

    families = ['Merriweather', 'Playfair Display']
    rerender()

    // Key unchanged → effect bails → no second link appended
    expect(getHeadLinks()).toHaveLength(0)
  })

  it('appends a new link when the families list changes to a different set', () => {
    let families = ['Source Sans 3']
    const { rerender } = renderHook(() => useGoogleFonts(families))

    // Switch to a different font — new key triggers a new load
    families = ['PT Sans']
    rerender()

    // Two distinct loads → two link elements (PT Sans is not yet in loadedFonts)
    expect(getHeadLinks()).toHaveLength(2)
    expect(getHeadLinks()[1].href).toContain('family=PT+Sans')
  })

  it('the link element has rel="stylesheet"', () => {
    renderHook(() => useGoogleFonts(['Fira Sans']))

    const link = getHeadLinks()[0]
    expect(link.rel).toBe('stylesheet')
  })

  it('includes display=swap in the URL', () => {
    renderHook(() => useGoogleFonts(['Work Sans']))

    expect(getHeadLinks()[0].href).toContain('display=swap')
  })

  it('includes the wght axis range in the URL', () => {
    renderHook(() => useGoogleFonts(['DM Sans']))

    expect(getHeadLinks()[0].href).toContain('wght@100..900')
  })
})
