'use client'

import {useEffect, useRef, useState, createContext} from 'react';
import { MsgResource } from '@worldware/msg';

/** The resource provided by the nearest {@link MsgResourceProvider}, or `null`. */
export const MsgResourceContext = createContext<MsgResource | null>(null)

/**
 * Props for {@link MsgResourceProvider}.
 * @typeParam K - Message keys of the resource. Defaults to `string`.
 */
export type MsgProviderProps<K extends string = string> = {
  resource: MsgResource<K>,
  children: React.ReactNode
}

/**
 * Provides `resource` to descendants, translated to the language of the
 * nearest `[lang]` ancestor (or `navigator.language`), and re-translates when
 * that `lang` attribute changes. Accepts typed and untyped resources.
 */
export function MsgResourceProvider(props: MsgProviderProps) {
  const { resource, children } = props;

  const msgRef = useRef<HTMLDivElement>(null);
  const [res, setRes] = useState<MsgResource>(resource);
  
  function detectLanguageChange(element: Element) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          const lang = element.getAttribute('lang') || navigator.language;
          if (lang) {
            translate(lang);
          }
        }
      })
    });

    observer.observe(element, {attributes: true, attributeFilter: ['lang']});
    return observer;
  }

  function getClosestElementWithLangAttribute(): Element | null | undefined {
    return msgRef.current?.closest('[lang]');
  }

  async function translate(langTag: string) {
    try {
      const translated = await resource.getTranslation(langTag)
      setRes(translated);
    } catch (e) {
      setRes(resource);
    }
  }

  useEffect(() => {
    const closest = getClosestElementWithLangAttribute() || document.documentElement;
    const lang = closest.getAttribute('lang') || navigator.language;
    if (lang) {
      translate(lang);
    }
    const observer = detectLanguageChange(closest);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={msgRef}>
      <MsgResourceContext value={res}>
        {children}
      </MsgResourceContext>
    </div>
  )
}
