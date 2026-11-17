import type { JSX } from 'react';
import type { MsgResource } from '@worldware/msg';
import { MsgMessage, type MsgMessageProps } from '../MsgMessage/index.js';
import { MsgResourceProvider, type MsgProviderProps } from '../MsgResourceProvider/index.js';

/**
 * The message key union of a `MsgResource` type: `'a' | 'b'` for a resource
 * created with `messages: [...] as const`, or `string` for an untyped one.
 */
export type MsgKeyOf<R extends MsgResource> =
  R extends MsgResource<infer K> ? K : never;

/** Provider and message components whose `msgKey` is checked against `K`. */
export type MsgComponents<K extends string> = {
  MsgResourceProvider: (props: MsgProviderProps<K>) => JSX.Element;
  MsgMessage: (props: MsgMessageProps<K>) => JSX.Element;
};

/**
 * Returns `MsgResourceProvider` and `MsgMessage` typed to a resource's message
 * keys, so a misspelled `msgKey` is a compile error.
 *
 * The returned components are the regular exports with narrower types; there
 * is no runtime wrapper, and they share one context with the untyped ones. The
 * argument is only used for type inference, so the explicit form
 * `createMsgComponents<typeof resource>()` is equivalent.
 *
 * @param resource - A resource whose key type to bind (optional; used only
 *   for type inference).
 * @typeParam R - The resource type; inferred from `resource` when passed.
 */
export function createMsgComponents<R extends MsgResource>(
  resource?: R
): MsgComponents<MsgKeyOf<R>> {
  // No casts needed: the untyped components accept every MsgResource<K> and
  // every K extends string, so they are assignable to the typed signatures.
  return { MsgResourceProvider, MsgMessage };
}
