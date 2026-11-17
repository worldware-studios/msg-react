'use client'

import { useContext } from 'react';
import { type MessageFormatOptions } from 'messageformat';
import { MsgResourceContext } from '../MsgResourceProvider/index.js'

/**
 * Props for {@link MsgMessage}.
 * @typeParam K - Allowed message keys. Defaults to `string` (any key); typed
 *   components from `createMsgComponents` narrow it to a resource's keys.
 */
export type MsgMessageProps<K extends string = string> = {
  // Scaffold: still `string`; narrowed to K in the implementation.
  msgKey: string,
  data?: Record<string, any>,
  options?: MessageFormatOptions
}

export function MsgMessage(props: MsgMessageProps) {
  
  const { msgKey, data, options } = props;

  const messages = useContext(MsgResourceContext);

  const message = messages?.get(msgKey);

  const msg = data
    ? message?.format(data, options)
    : message?.toString();

  return (
      <span className="msg" lang={message?.attributes.lang} dir={message?.attributes.dir}>
          {msg}
      </span>
  )
}
