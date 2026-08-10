'use client'

import { useContext } from 'react';
import { type MessageFormatOptions } from 'messageformat';
import { MsgResourceContext } from '../MsgResourceProvider/index.js'

type MsgMessageProps = {
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
