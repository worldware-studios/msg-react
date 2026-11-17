// Type-level tests: checked by `vitest --typecheck` (wired into `npm test`),
// never executed. `@ts-expect-error` lines must produce a type error.
import { describe, expectTypeOf, test } from 'vitest';
import { MsgResource, type MsgProject } from '@worldware/msg';
import {
  createMsgComponents,
  MsgMessage,
  MsgResourceProvider,
  type MsgKeyOf,
} from '../../index.js';

declare const project: MsgProject;

const typed = MsgResource.create(
  {
    title: 'Home',
    attributes: { lang: 'en' },
    messages: [
      { key: 'home.title', value: 'Welcome' },
      { key: 'home.body', value: 'Hi, {$name}' },
    ] as const,
  },
  project
);
const untyped = MsgResource.create({ title: 'Loose', attributes: { lang: 'en' } }, project);

describe('MsgKeyOf', () => {
  test('extracts the key union of a typed resource', () => {
    expectTypeOf<MsgKeyOf<typeof typed>>().toEqualTypeOf<'home.title' | 'home.body'>();
  });

  test('is string for an untyped resource', () => {
    expectTypeOf<MsgKeyOf<typeof untyped>>().toEqualTypeOf<string>();
  });
});

describe('createMsgComponents (inferred from a resource value)', () => {
  const { MsgResourceProvider: Provider, MsgMessage: Message } = createMsgComponents(typed);

  test('accepts known keys', () => {
    <Message msgKey="home.title" />;
    <Message msgKey="home.body" data={{ name: 'Kat' }} />;
  });

  test('rejects unknown keys', () => {
    // @ts-expect-error -- 'home.titel' is not a key of the resource
    <Message msgKey="home.titel" />;
  });

  test('typed provider takes the typed resource', () => {
    <Provider resource={typed}>
      <Message msgKey="home.title" />
    </Provider>;
  });

  test('typed provider rejects a resource with other keys', () => {
    // @ts-expect-error -- an untyped resource may lack 'home.title' / 'home.body'
    <Provider resource={untyped}>{null}</Provider>;
  });
});

describe('createMsgComponents (explicit type argument)', () => {
  const { MsgMessage: Message } = createMsgComponents<typeof typed>();

  test('accepts known keys and rejects unknown ones', () => {
    <Message msgKey="home.body" />;
    // @ts-expect-error -- 'nope' is not a key of the resource
    <Message msgKey="nope" />;
  });
});

describe('createMsgComponents (untyped resource)', () => {
  const { MsgMessage: Message } = createMsgComponents(untyped);

  test('accepts any string key', () => {
    <Message msgKey="anything.at.all" />;
  });
});

describe('existing untyped exports', () => {
  test('MsgMessage still accepts any string key', () => {
    <MsgMessage msgKey="anything.at.all" />;
  });

  test('MsgResourceProvider still accepts typed and untyped resources', () => {
    <MsgResourceProvider resource={typed}>{null}</MsgResourceProvider>;
    <MsgResourceProvider resource={untyped}>{null}</MsgResourceProvider>;
  });
});
