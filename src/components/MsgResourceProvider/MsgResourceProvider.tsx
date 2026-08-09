import {useEffect, useRef, useState, createContext} from 'react';
import { type MsgResource } from '@worldware/msg';

export const MsgResourceContext = createContext<MsgResource | null>(null)

type MsgProviderProps = {
  resource: MsgResource,
  children: React.ReactNode
}

export function MsgResourceProvider(props: MsgProviderProps) {
  const { resource, children } = props;

  const msgRef = useRef<HTMLDivElement>(null);
  const [res, setRes] = useState(resource)
  
  useEffect(() => {
    const closestLangAttribute: string | null | undefined = msgRef.current?.closest('[lang]')?.getAttribute('lang');
    const navigatorLanguage: string = navigator.language;
    const lang = closestLangAttribute ?? navigatorLanguage;

    async function translate(langTag: string) {
      const res = await resource.getTranslation(langTag);
      setRes(res);
    }
    if (lang) {
      translate(lang);
    }
  }, [resource]);

  return (
    <div ref={msgRef}>
      <MsgResourceContext value={res}>
        {children}
      </MsgResourceContext>
    </div>
  )
}

