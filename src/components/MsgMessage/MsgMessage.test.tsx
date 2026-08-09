import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MsgMessage } from './MsgMessage.js'
import { MsgResourceContext } from '../MsgResourceProvider/index.js'
import { createMockMessage, createMockResource } from '../../test/mocks.js'

describe('MsgMessage', () => {
  it('formats with data and renders the result', () => {
    const message = createMockMessage({ formatted: 'Hello Kat' })
    const resource = createMockResource({
      messages: { greeting: message },
    })
    const data = { name: 'Kat' }
    const options = { bidiIsolation: 'none' as const }

    render(
      <MsgResourceContext value={resource}>
        <MsgMessage msgKey="greeting" data={data} options={options} />
      </MsgResourceContext>,
    )

    expect(screen.getByText('Hello Kat')).toBeInTheDocument()
    expect(message.format).toHaveBeenCalledWith(data, options)
    expect(message.toString).not.toHaveBeenCalled()
  })

  it('renders toString when data is omitted', () => {
    const message = createMockMessage({ text: 'Hello {$name}' })
    const resource = createMockResource({
      messages: { greeting: message },
    })

    render(
      <MsgResourceContext value={resource}>
        <MsgMessage msgKey="greeting" />
      </MsgResourceContext>,
    )

    expect(screen.getByText('Hello {$name}')).toBeInTheDocument()
    expect(message.toString).toHaveBeenCalled()
    expect(message.format).not.toHaveBeenCalled()
  })

  it('sets lang and dir from message attributes', () => {
    const message = createMockMessage({ lang: 'ar', dir: 'rtl', text: 'مرحبا' })
    const resource = createMockResource({
      messages: { greeting: message },
    })

    render(
      <MsgResourceContext value={resource}>
        <MsgMessage msgKey="greeting" />
      </MsgResourceContext>,
    )

    const span = screen.getByText('مرحبا')
    expect(span).toHaveAttribute('lang', 'ar')
    expect(span).toHaveAttribute('dir', 'rtl')
  })

  it('renders an empty span when the message is missing', () => {
    const resource = createMockResource()

    const { container } = render(
      <MsgResourceContext value={resource}>
        <MsgMessage msgKey="missing" />
      </MsgResourceContext>,
    )

    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
    expect(span).toBeEmptyDOMElement()
  })

  it('renders an empty span when context is null', () => {
    const { container } = render(<MsgMessage msgKey="greeting" />)

    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
    expect(span).toBeEmptyDOMElement()
  })
})
