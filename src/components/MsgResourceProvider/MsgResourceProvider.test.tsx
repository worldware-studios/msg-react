import { useContext } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import {
  MsgResourceProvider,
  MsgResourceContext,
} from './MsgResourceProvider.js'
import { createMockResource } from '../../test/mocks.js'

function ContextProbe() {
  const resource = useContext(MsgResourceContext)
  return <span data-testid="probe">{resource ? 'has-resource' : 'no-resource'}</span>
}

function ContextTitleProbe({ expected }: { expected: unknown }) {
  const resource = useContext(MsgResourceContext)
  return (
    <span data-testid="probe">
      {resource === expected ? 'matched' : 'different'}
    </span>
  )
}

describe('MsgResourceProvider', () => {
  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children', () => {
    const resource = createMockResource()

    render(
      <MsgResourceProvider resource={resource}>
        <span>child content</span>
      </MsgResourceProvider>,
    )

    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('exposes the initial resource via context', async () => {
    const resource = createMockResource()

    render(
      <MsgResourceProvider resource={resource}>
        <ContextTitleProbe expected={resource} />
      </MsgResourceProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('matched')
  })

  it('calls getTranslation with lang from the nearest [lang] ancestor', async () => {
    const translated = createMockResource()
    const resource = createMockResource({ translation: translated })

    render(
      <div lang="fr">
        <MsgResourceProvider resource={resource}>
          <ContextProbe />
        </MsgResourceProvider>
      </div>,
    )

    await waitFor(() => {
      expect(resource.getTranslation).toHaveBeenCalledWith('fr')
    })
  })

  it('falls back to navigator.language when no [lang] ancestor exists', async () => {
    const resource = createMockResource()

    render(
      <MsgResourceProvider resource={resource}>
        <ContextProbe />
      </MsgResourceProvider>,
    )

    await waitFor(() => {
      expect(resource.getTranslation).toHaveBeenCalledWith('en-US')
    })
  })

  it('updates context after getTranslation resolves', async () => {
    const translated = createMockResource()
    const resource = createMockResource({ translation: translated })

    render(
      <MsgResourceProvider resource={resource}>
        <ContextTitleProbe expected={translated} />
      </MsgResourceProvider>,
    )

    expect(screen.getByTestId('probe')).toHaveTextContent('different')

    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveTextContent('matched')
    })
  })

  it('re-translates when the [lang] ancestor changes language', async () => {
    const resource = createMockResource()

    const { container } = render(
      <div lang="fr">
        <MsgResourceProvider resource={resource}>
          <ContextProbe />
        </MsgResourceProvider>
      </div>,
    )
    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('fr'))

    act(() => {
      container.querySelector('[lang]')!.setAttribute('lang', 'de')
    })

    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('de'))
  })

  it('falls back to navigator.language when the lang attribute is removed', async () => {
    const resource = createMockResource()

    const { container } = render(
      <div lang="fr">
        <MsgResourceProvider resource={resource}>
          <ContextProbe />
        </MsgResourceProvider>
      </div>,
    )
    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('fr'))

    act(() => {
      container.querySelector('[lang]')!.removeAttribute('lang')
    })

    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('en-US'))
  })

  it('keeps the original resource when getTranslation rejects', async () => {
    const resource = createMockResource()
    resource.getTranslation.mockRejectedValueOnce(new Error('no translation'))

    render(
      <MsgResourceProvider resource={resource}>
        <ContextTitleProbe expected={resource} />
      </MsgResourceProvider>,
    )

    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalled())
    expect(screen.getByTestId('probe')).toHaveTextContent('matched')
  })

  it('does not translate when no language can be determined', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('')
    const resource = createMockResource()

    const { container } = render(
      <div lang="fr">
        <MsgResourceProvider resource={resource}>
          <ContextProbe />
        </MsgResourceProvider>
      </div>,
    )
    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('fr'))
    resource.getTranslation.mockClear()

    // Removing lang with no navigator.language leaves nothing to translate to.
    act(() => {
      container.querySelector('[lang]')!.removeAttribute('lang')
    })
    await act(async () => {})

    expect(resource.getTranslation).not.toHaveBeenCalled()
  })

  it('skips the initial translation when neither lang nor navigator.language is set', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('')
    const resource = createMockResource()

    render(
      <MsgResourceProvider resource={resource}>
        <ContextTitleProbe expected={resource} />
      </MsgResourceProvider>,
    )
    await act(async () => {})

    expect(resource.getTranslation).not.toHaveBeenCalled()
    expect(screen.getByTestId('probe')).toHaveTextContent('matched')
  })

  it('stops observing lang changes after unmount', async () => {
    const resource = createMockResource()
    const host = document.createElement('div')
    host.setAttribute('lang', 'fr')
    document.body.appendChild(host)

    const { unmount } = render(
      <MsgResourceProvider resource={resource}>
        <ContextProbe />
      </MsgResourceProvider>,
      { container: host },
    )
    await waitFor(() => expect(resource.getTranslation).toHaveBeenCalledWith('fr'))
    unmount()
    resource.getTranslation.mockClear()

    host.setAttribute('lang', 'de')
    await act(async () => {})

    expect(resource.getTranslation).not.toHaveBeenCalled()
    host.remove()
  })
})
