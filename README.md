# msg-react

React components for rendering messages from [`@worldware/msg`](https://www.npmjs.com/package/@worldware/msg).

## Installation

`@worldware/msg` is a **peer dependency** of `@worldware/msg-react` (and is marked external in the build). Install both packages in your app:

```bash
npm install @worldware/msg@^0.13.0 @worldware/msg-react
```

That keeps a single shared `@worldware/msg` instance and types in the dependency tree and avoids duplicate copies. On 0.x, caret ranges do not include the next minor, so install a `@worldware/msg` release that satisfies this package's peer (`^0.13.0`). Typed message keys (see [`createMsgComponents`](#createmsgcomponents)) need 0.13 or later.

## Components

### `MsgResourceProvider`

Provides a `MsgResource` to descendants via React context. On mount, it resolves a language tag from the nearest ancestor with a `lang` attribute, or falls back to `navigator.language`, then calls `resource.getTranslation(lang)` and updates the context with the result.

| Prop | Type | Description |
| --- | --- | --- |
| `resource` | `MsgResource<K>` | Message resource to expose and translate. `K` defaults to `string`, so any resource is accepted. |
| `children` | `React.ReactNode` | Tree that can consume the resource |

Also exports `MsgResourceContext` if you need to read the resource directly with `useContext`.

### `MsgMessage`

Looks up a message by key from `MsgResourceContext` and renders it inside a `<span>` with `lang` and `dir` from the message attributes.

| Prop | Type | Description |
| --- | --- | --- |
| `msgKey` | `K` (default `string`) | Key of the message to render. Narrowed to a resource's keys by [`createMsgComponents`](#createmsgcomponents). |
| `data` | `Record<string, any>` (optional) | Values passed to `message.format()` |
| `options` | `MessageFormatOptions` (optional) | Options forwarded to `message.format()` |

- With `data`: calls `message.format(data, options)`
- Without `data`: calls `message.toString()`
- Missing key or null context: renders an empty `<span>`

### `createMsgComponents`

Returns `MsgResourceProvider` and `MsgMessage` typed to one resource's message keys, so a misspelled `msgKey` is a compile error instead of an empty `<span>`.

```ts
createMsgComponents(resource)          // infer keys from a resource value
createMsgComponents<typeof resource>() // or pass the resource type explicitly
```

- Keys are inferred when the resource's `messages` are a const assertion (`as const` in TypeScript, `/** @type {const} */ (…)` in JavaScript, which is what `msg create resource` generates). Otherwise the keys stay `string` and any key is accepted.
- The returned components **are** the regular exports, with narrower types and no runtime wrapper. They share `MsgResourceContext`, so typed and untyped components can be mixed.
- Related types: `MsgKeyOf<R>` (a resource type's key union), `MsgComponents<K>`, `MsgMessageProps<K>`, `MsgProviderProps<K>`.

## Usage

### Basic setup

Wrap your app (or a subtree) with `MsgResourceProvider` passing in an `MsgResource` instance, then render messages with `MsgMessage`:

```tsx
import { MsgResource } from '@worldware/msg'
import { MsgResourceProvider, MsgMessage } from '@worldware/msg-react'

const resource = MsgResource.create(/* ... */)

function App() {
  return (
    <div lang="en">
      <MsgResourceProvider resource={resource}>
        <h1>
          <MsgMessage msgKey="greeting" data={{ name: 'Kat' }} />
        </h1>
      </MsgResourceProvider>
    </div>
  )
}
```

### Typed message keys

Bind the components to a resource once, in a client module, and use those everywhere you render that resource's messages:

```tsx
// i18n/home.tsx
'use client'
import { MsgResource } from '@worldware/msg'
import { createMsgComponents } from '@worldware/msg-react'
import project from './project.js' // your MsgProject

export const resource = MsgResource.create({
  title: 'Home',
  attributes: { lang: 'en' },
  messages: [
    { key: 'home.title', value: 'Welcome' },
    { key: 'home.greeting', value: 'Hi, {$name}' },
  ] as const,
}, project)

export const { MsgResourceProvider, MsgMessage } = createMsgComponents(resource)
```

```tsx
import { MsgResourceProvider, MsgMessage, resource } from './i18n/home.js'

<MsgResourceProvider resource={resource}>
  <MsgMessage msgKey="home.title" />                          {/* ok */}
  <MsgMessage msgKey="home.greeting" data={{ name: 'Kat' }} /> {/* ok */}
  <MsgMessage msgKey="home.titel" />                          {/* type error */}
</MsgResourceProvider>
```

The untyped `MsgResourceProvider` also accepts a typed resource, so you can adopt typed keys one component at a time.

> **React Server Components:** the components use hooks, so render them from client modules (`'use client'`). The published bundle doesn't yet preserve the `'use client'` directive ([#22](https://github.com/worldware-studios/msg-react/issues/22)), so mark the module that imports them as a client module yourself.

### Format with data and options

Pass `data` (and optional `options`) to call `message.format()`:

```tsx
<MsgMessage
  msgKey="greeting"
  data={{ name: 'Kat' }}
  options={{ bidiIsolation: 'none' }}
/>
```

### Plain message text

Omit `data` to render `message.toString()` instead:

```tsx
<MsgMessage msgKey="welcome" />
```

### Language resolution

`MsgResourceProvider` picks a language from the nearest ancestor with a `lang` attribute:

```tsx
<div lang="fr">
  <MsgResourceProvider resource={resource}>
    <MsgMessage msgKey="greeting" data={{ name: 'Kat' }} />
  </MsgResourceProvider>
</div>
```

If no `lang` ancestor exists, it falls back to the `navigator.language` setting.

### Read the resource from context

Use `MsgResourceContext` when you need the resource outside of `MsgMessage`:

```tsx
import { useContext } from 'react'
import { MsgResourceContext } from '@worldware/msg-react'

function MessageCount() {
  const resource = useContext(MsgResourceContext)
  // use resource.get(...), etc.
  return null
}
```

## Scripts

| Script | Description |
| --- | --- |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Bundle ESM + CJS (and types) to `dist/` via tsup |
