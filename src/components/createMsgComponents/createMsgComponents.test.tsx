import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { MsgResource } from '@worldware/msg';
import { createMsgComponents } from './createMsgComponents.js';
import { MsgMessage } from '../MsgMessage/index.js';
import { MsgResourceProvider } from '../MsgResourceProvider/index.js';
import { createMockMessage, createMockResource } from '../../test/mocks.js';

describe('createMsgComponents', () => {
  beforeEach(() => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the existing components (types only, no runtime wrapper)', () => {
    const components = createMsgComponents(createMockResource());
    expect(components.MsgResourceProvider).toBe(MsgResourceProvider);
    expect(components.MsgMessage).toBe(MsgMessage);
  });

  it('works without a resource argument (explicit type argument form)', () => {
    const components = createMsgComponents<MsgResource<'greeting'>>();
    expect(components.MsgMessage).toBe(MsgMessage);
  });

  it('renders a typed message through the typed provider', async () => {
    const resource = createMockResource({
      messages: { greeting: createMockMessage({ text: 'Hello there', lang: 'en', dir: 'ltr' }) },
    }) as unknown as MsgResource<'greeting'>;
    const { MsgResourceProvider: Provider, MsgMessage: Message } = createMsgComponents(resource);

    render(
      <Provider resource={resource}>
        <Message msgKey="greeting" />
      </Provider>,
    );

    const el = await screen.findByText('Hello there');
    expect(el).toHaveAttribute('lang', 'en');
    expect(el).toHaveAttribute('dir', 'ltr');
  });
});
