import { useContext } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
})
