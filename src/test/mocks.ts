import { vi } from 'vitest'
import type { MsgMessage, MsgResource } from '@worldware/msg'

type MockMessageOptions = {
  text?: string
  formatted?: string
  lang?: string
  dir?: string
}

export function createMockMessage(options: MockMessageOptions = {}) {
  const {
    text = 'Hello',
    formatted = 'Hello World',
    lang = 'en',
    dir = 'ltr',
  } = options

  return {
    format: vi.fn(() => formatted),
    toString: vi.fn(() => text),
    attributes: { lang, dir },
  } as unknown as MsgMessage & {
    format: ReturnType<typeof vi.fn>
    toString: ReturnType<typeof vi.fn>
  }
}

type MockResourceOptions = {
  messages?: Record<string, ReturnType<typeof createMockMessage>>
  translation?: MsgResource
}

export function createMockResource(options: MockResourceOptions = {}) {
  const { messages = {}, translation } = options
  const resource = {
    get: vi.fn((key: string) => messages[key]),
    getTranslation: vi.fn(async () => translation ?? resource),
  }

  return resource as unknown as MsgResource & {
    get: ReturnType<typeof vi.fn>
    getTranslation: ReturnType<typeof vi.fn>
  }
}
