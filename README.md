# msg-react

React components for rendering messages from [`@worldware/msg`](https://www.npmjs.com/package/@worldware/msg).

## Components

### `MsgResourceProvider`

Provides a `MsgResource` to descendants via React context. On mount, it resolves a language tag from the nearest ancestor with a `lang` attribute, or falls back to `navigator.language`, then calls `resource.getTranslation(lang)` and updates the context with the result.

| Prop | Type | Description |
| --- | --- | --- |
| `resource` | `MsgResource` | Message resource to expose and translate |
| `children` | `React.ReactNode` | Tree that can consume the resource |

Also exports `MsgResourceContext` if you need to read the resource directly with `useContext`.

### `MsgMessage`

Looks up a message by key from `MsgResourceContext` and renders it inside a `<span>` with `lang` and `dir` from the message attributes.

| Prop | Type | Description |
| --- | --- | --- |
| `msgKey` | `string` | Key of the message to render |
| `data` | `Record<string, any>` (optional) | Values passed to `message.format()` |
| `options` | `MessageFormatOptions` (optional) | Options forwarded to `message.format()` |

- With `data`: calls `message.format(data, options)`
- Without `data`: calls `message.toString()`
- Missing key or null context: renders an empty `<span>`

## Usage

### Basic setup

Wrap your app (or a subtree) with `MsgResourceProvider`, then render messages with `MsgMessage`:

```tsx
import { MsgResource } from '@worldware/msg'
import { MsgResourceProvider, MsgMessage } from 'msg-react'

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

If no `lang` ancestor exists, it falls back to `navigator.language`.

### Read the resource from context

Use `MsgResourceContext` when you need the resource outside of `MsgMessage`:

```tsx
import { useContext } from 'react'
import { MsgResourceContext } from 'msg-react'

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
