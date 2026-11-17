import type { JSX } from 'react';
import type { MsgResource } from '@worldware/msg';
import type { MsgMessageProps } from '../MsgMessage/index.js';
import type { MsgProviderProps } from '../MsgResourceProvider/index.js';

/**
 * The message key union of a `MsgResource` type.
 * Scaffold: always `string`; infers the resource's keys in the implementation.
 */
export type MsgKeyOf<R extends MsgResource> = string;

/** Provider and message components whose `msgKey` is checked against `K`. */
export type MsgComponents<K extends string> = {
  MsgResourceProvider: (props: MsgProviderProps<K>) => JSX.Element;
  MsgMessage: (props: MsgMessageProps<K>) => JSX.Element;
};

/**
 * Returns `MsgResourceProvider` and `MsgMessage` typed to a resource's keys.
 * Scaffold: returns untyped components and throws at runtime.
 */
export function createMsgComponents<R extends MsgResource>(
  _resource?: R
): MsgComponents<string> {
  throw new Error('createMsgComponents is not implemented yet');
}
